import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api-service';
import { ColumnsResponse } from '../api/response/columns-response';
import { SearchResponse, SearchRow } from '../api/response/search-reponse';
import { MatDialog, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { SearchResultDetailsModalComponent } from './search-result-details-modal/search-result-details-modal.component';
import { Converter } from '../utils/converter';
import { SearchResultAddColumnsModalComponent } from './search-result-add-columns/search-result-add-columns-modal.component';
import { AddColumnsModalData } from './search-result-add-columns/add-columns-modal-data';
import { isNullOrUndefined } from 'util';
import { SelectedTags } from './search-result-tags-selection/selected-tags';
import { SearchSettingsService } from '../settings/search-settings-service/search-settings.service';
import { TamanduaTableDataSource } from './tamandua-table-data-source';
import { SaveObjectData } from '../save-object/save-object-data';
import { JsonSaveStrategy } from '../save-object/strategies/json-save-strategy';
import { YamlSaveStrategy } from '../save-object/strategies/yaml-save-strategy';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss' ]
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  @Input()
  public set searchResult (value: SearchResponse) {
    this.clearFilters();
    this.processRows(value);
  }

  private _rows: TamanduaTableDataSource<SearchRow>;
  public get rows (): TamanduaTableDataSource<SearchRow> {
    return this._rows;
  }

  public get hasRows (): boolean {
    return this.allRows.length > 0;
  }

  public get visibleColumns (): Array<string> {
    return this.searchSettingsService.getVisibleColumns();
  }

  public get visibleColumnsWithMetadata (): Array<string> {
    return [ 'details', ...this.visibleColumns ];
  }

  public get pageSizeOptions (): Array<number> {
    return this.searchSettingsService.getPageSizeOptions();
  }

  public get pageSize (): number {
    return this.searchSettingsService.getPaginatorPageSize();
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
    'array': this.compareArray.bind(this),
    'undefined': this.compareUndefined.bind(this),
    'null': this.compareNull.bind(this)
  };

  private _onFilterChange: Subject<any>;

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
               private searchSettingsService: SearchSettingsService,
               private dialog: MatDialog) {
    this._onFilterChange = new Subject<any>();
    this._onFilterChange
      .asObservable()
      .pipe(
        debounceTime(500),
      ).subscribe(() => this.updateFilter());

    this._rows = new TamanduaTableDataSource<SearchRow>();
    this.allRows = [];
    this.allColumns = [];

    this.clearFilters();
  }

  ngOnInit () {
    this.apiService.getColumns().subscribe(this.processColumns.bind(this));
  }

  ngAfterViewInit () {
    this._rows.paginator = this.paginator;
    this._rows.sort = this.sort;
  }

  public setSelectedTags (values: SelectedTags) {
    this.searchSettingsService.setSelectedTags(values);

    const newFilter = [];
    for (const value of values) {
      if (value.selected) {
        newFilter.push(value.tag, '|');
      }
    }
    newFilter.splice(newFilter.length - 1, 1);

    this.setFilter(newFilter.join(''), 'tags');
  }

  public addColumns (): void {
    this.dialog.open(SearchResultAddColumnsModalComponent, {
      data: {
        allColumns: this.allColumns,
        displayedColumns: this.searchSettingsService.getVisibleColumns()
      } as AddColumnsModalData
    });
  }

  public showDetails (row: SearchRow) {
    this.dialog.open(SearchResultDetailsModalComponent, {
      width: '98%',
      data: row
    });
  }

  public getFilter (column: string): string {
    const value = this.filter[ column ];
    return isNullOrUndefined(value) ? '' : value;
  }

  public setFilter (filterValue: string, column: string): void {
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

    // this.updateFilter();
    this._onFilterChange.next();
  }

  public generateSaveDataObject (): SaveObjectData {
    const data = new Map<string, any>();
    data.set('rows', this._rows.data);

    return {
      filename: 'results',
      data: data,
      strategies: [
        new JsonSaveStrategy(),
        new YamlSaveStrategy()
      ]
    };
  }

  public onPageSizeChange (event: PageEvent): void {
    this.searchSettingsService.setPaginatorPageSize(event.pageSize);
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

  private compareUndefined (value: any, filter: string, regexFilter: RegExp): boolean {
    // exclude undefined values from filter results
    return false;
  }

  private compareNull (value: any, filter: string, regexFilter: RegExp): boolean {
    // exclude null values from filter results
    return false;
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

        const comparer = this.typeCompareFunctionMap[ typeStr ];
        if (isNullOrUndefined(comparer)) {
          console.warn(`No comparator found for type: ${typeStr} while filtering table.`);
        } else {
          if (!comparer(
              value,
              this.filter[ key ],
              this.filterAsRegex[ key ])) {
            isValid = false;
            break;
          }
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

  private clearFilters (): void {
    this.filter = new Map<string, string>();
    this.filterAsRegex = new Map<string, RegExp>();

    if (this.searchSettingsService.isReady) {
      this.setSelectedTags(this.searchSettingsService.getSelectedTags());
    }
  }

  private processColumns (columns: ColumnsResponse): void {
    this.allColumns = columns;
  }

  private processRows (result: SearchResponse): void {
    if (isNullOrUndefined(result)) {
      return;
    }

    // process result

    this.totalRows = result.total_rows;
    this.allRows = result.rows;

    this.updateFilter();

    if (isNullOrUndefined(this._rows.sort)) {
      return;
    }

    const sortable = this._rows.sort.sortables.get('phdmxin_time');

    if (!isNullOrUndefined(sortable)) {
      sortable.start = 'desc';
      this.sort.active = undefined;
      this.sort.sort(sortable);
    }
  }
}
