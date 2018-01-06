import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api-service';
import { ColumnsResponse } from '../api/response/columns-response';
import { SearchResponse, SearchRow } from '../api/response/search-reponse';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { SearchResultDetailsModalComponent } from './search-result-details-modal/search-result-details-modal.component';
import { Converter } from '../converter';
import { SearchResultAddColumnsModalComponent } from './search-result-add-columns/search-result-add-columns-modal.component';
import { AddColumnsModalData } from './search-result-add-columns/add-columns-modal-data';
import { isNullOrUndefined } from 'util';
import { SelectedTags } from './search-result-tags-selection/selected-tags';
import { TamanduaMockService } from '../api/tamandua-mock.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss' ]
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  private _rows: MatTableDataSource<SearchRow>;
  public get rows (): MatTableDataSource<SearchRow> {
    return this._rows;
  }

  private _visibleColumns = [
    'phdmxin_time',
    'sender',
    'recipient',
    'tags'
  ];

  public get visibleColumns (): Array<string> {
    return this._visibleColumns;
  }

  public get visibleColumnsWithMetadata (): Array<string> {
    return [ 'details', ...this.visibleColumns ];
  }

  private totalRows: number;
  private allColumns: Array<string>;
  private allRows: Array<SearchRow>;

  private filter: Map<string, string>;
  private filterAsRegex: Map<string, RegExp>;

  private readonly typeCompareFunctionMap = {
    'number': this.compareNumber.bind(this),
    'string': this.compareString.bind(this),
    'object': this.compareObject.bind(this),
    'datetime': this.compareDatetime.bind(this),
    'array': this.compareArray.bind(this)
  };

  private static genericCompare<T> (value: T, filter: string, filterTransformLambda: (string) => T): boolean {
    if (filter.startsWith('>=')) {
      return value >= filterTransformLambda(filter.slice(2, filter.length));
    }

    if (filter.startsWith('<=')) {
      return value <= filterTransformLambda(filter.slice(2, filter.length));
    }

    if (filter.startsWith('>')) {
      return value > filterTransformLambda(filter.slice(1, filter.length));
    }

    if (filter.startsWith('<')) {
      return value < filterTransformLambda(filter.slice(1, filter.length));
    }

    return value === filterTransformLambda(filter);
  }

  constructor (private apiService: ApiService,
               private dialog: MatDialog) {
    this._rows = new MatTableDataSource<SearchRow>();
    this.filter = new Map<string, string>();
  }

  ngOnInit () {
    this.apiService.getColumns().then(this.processColumns.bind(this));

    const builder = this.apiService.getRequestBuilder();
    builder.setEndpoint(new SearchEndpoint(0, 1000));
    builder.setCallback(this.processRows.bind(this));

    this.apiService.SubmitRequest(builder.build());
  }

  ngAfterViewInit () {
    this.rows.paginator = this.paginator;
    this.rows.sort = this.sort;
  }

  public setSelectedTags (values: SelectedTags) {
    const newFilter = [];
    for (const value of values) {
      if (value.selected) {
        newFilter.push(value.tag, '|');
      }
    }
    newFilter.splice(newFilter.length - 1, 1);

    this.applyFilter(newFilter.join(''), 'tags');
  }

  public addColumns (): void {
    this.dialog.open(SearchResultAddColumnsModalComponent, {
      data: {
        allColumns: this.allColumns,
        displayedColumns: this._visibleColumns
      } as AddColumnsModalData
    });
  }

  public showDetails (row: SearchRow) {
    this.dialog.open(SearchResultDetailsModalComponent, {
      width: '80%',
      data: row
    });
  }

  public applyFilter (filterValue: string, column: string): void {
    if (!filterValue) {
      // remove key `column`
      // delete this.filter[column] does not work (and may be slow on certain engines)
      this.filter = Object.keys(this.filter).reduce((result, key) => {
        if (key !== column) {
          result[ key ] = this.filter[ key ];
        }
        return result;
      }, {}) as Map<string, string>;
    } else {
      this.filter[ column ] = filterValue.trim();
    }

    this.filterAsRegex = new Map<string, RegExp>();
    Object.keys(this.filter).map(key =>
      this.filterAsRegex[ key ] = new RegExp(this.filter[ key ], 'i'));

    this.updateFilter();
  }

  public sortData (sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    let sortFunction: <T>(a: T, b: T) => number;
    const isAsc = sort.direction === 'asc';

    if (sort.active.slice(sort.active.length - 4, sort.active.length) === 'time') {
      sortFunction = (a, b) => Converter.stringToDate(a.toString()).getTime() - Converter.stringToDate(b.toString()).getTime();
    } else {
      sortFunction = (a, b) => a === b ? 0 : (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    this._rows.data = this._rows.data.sort((a, b) => sortFunction(a[ sort.active ], b[ sort.active ]));
  }

  private compareNumber (value: number, filter: string, regexFilter: RegExp): boolean {
    return SearchResultsComponent.genericCompare<number>(value, filter, parseFloat);
  }

  private compareString (value: string, filter: string, regexFilter: RegExp): boolean {
    return regexFilter.test(value);
  }

  private compareArray (values: Array<string>, filter: string, regexFilter: RegExp): boolean {
    // only | connective is supported atm

    let isValid = false;

    const expressionParts = filter.split('|');
    for (let i = 0; i < expressionParts.length; i++) {
      let isMatch = false;

      for (let j = 0; j < values.length; j++) {
        const part = expressionParts[ i ].trim();

        isMatch = this.typeCompareFunctionMap[ this.isKeyDatetime(values[ j ]) ? 'datetime' : typeof(values[ j ]) ](
          values[ j ],
          part,
          new RegExp(part));

        if (isMatch) {
          break;
        }
      }

      isValid = isValid || isMatch;
    }

    return isValid;
  }

  private compareObject (value: object, filter: string, regexFilter: RegExp): boolean {
    console.warn('The type ' + value.constructor.name + ' does not have a specific compare function. ' +
      'You should implement one. (Otherwise the object cannot be compared --> as long as it is ' +
      'not null or undefined, true is returned.)');
    return !value;
  }

  private compareDatetime (value: string, filter: string, regexFilter: RegExp): boolean {
    let finalValue = value;
    const stripedFilter = filter.replace(/^(>=|<=|<|>)/, '');

    if (Converter.isStringTimeOnly(stripedFilter)) {
      finalValue = value.substring(value.indexOf(' ') + 1, value.length);
    } else if (Converter.isStringDateOnly(stripedFilter)) {
      finalValue = value.substring(0, value.indexOf(' '));
    }

    return SearchResultsComponent.genericCompare<number>(
      Converter.stringToDate(finalValue).getTime(),
      filter,
      f => Converter.stringToDate(f).getTime());
  }

  private isKeyDatetime (key: string): boolean {
    return key.slice(key.length - 4, key.length) === 'time';
  }

  private updateFilter (): void {
    // This needs to be ultra fast ... needs further investigation

    // prevent key evaluation for every row
    const filterKeys = Object.keys(this.filter);
    // prevent dereference array every iteration
    const filterKeyLength = filterKeys.length;

    const rows = [];

    // This loop here is probably slow, however it should be fast ...
    let counter = 0;
    for (let i = 0; i < this.allRows.length; ++i) {
      let isValid = true;

      // Check all filters. All filters need to match.
      for (let j = 0; j < filterKeyLength; ++j) {
        const key = filterKeys[ j ];
        const value = this.allRows[ i ][ filterKeys[ j ] ];
        let typeStr: string;

        if (this.isKeyDatetime(key)) {
          typeStr = 'datetime';
        } else if (value instanceof Array) {
          typeStr = 'array';
        } else {
          typeStr = typeof(value);
        }

        if (!this.typeCompareFunctionMap[ typeStr ](
            value,
            this.filter[ key ],
            this.filterAsRegex[ key ])) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        // .push( ... ) is slow:
        // https://jsperf.com/push-allocated-vs-dynamic
        rows[ counter++ ] = this.allRows[ i ];
      }
    }

    this._rows.data = rows;
  }

  private processColumns (columns: ColumnsResponse): void {
    this.allColumns = columns;
  }

  private processRows (result: SearchResponse): void {
    this.totalRows = result.total_rows;
    this.allRows = result.rows;

    this.updateFilter();

    const sortable = this.rows.sort.sortables.get('phdmxin_time');

    if (!isNullOrUndefined(sortable)) {
      sortable.start = 'desc';
      this.rows.sort.sort(sortable);
    }
  }
}
