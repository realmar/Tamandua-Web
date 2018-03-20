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
    return this._allRows.length > 0;
  }

  public get visibleColumns (): Array<string> {
    return this._searchSettingsService.getVisibleColumns();
  }

  public get visibleColumnsWithMetadata (): Array<string> {
    return [ 'details', ...this.visibleColumns ];
  }

  public get pageSizeOptions (): Array<number> {
    return this._searchSettingsService.getPageSizeOptions();
  }

  public get pageSize (): number {
    return this._searchSettingsService.getPaginatorPageSize();
  }

  private _totalRows: number;
  private _allColumns: Array<string>;
  private _allRows: Array<SearchRow>;

  private _filter: Map<string, string>;
  private _filterAsRegex: Map<string, RegExp>;

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

  constructor (private _apiService: ApiService,
               private _searchSettingsService: SearchSettingsService,
               private _dialog: MatDialog) {
    this._onFilterChange = new Subject<any>();
    this._onFilterChange
      .asObservable()
      .pipe(
        debounceTime(500),
      ).subscribe(() => this.updateFilter());

    this._rows = new TamanduaTableDataSource<SearchRow>();
    this._allRows = [];
    this._allColumns = [];

    this.clearFilters();
  }

  ngOnInit () {
    this._apiService.getColumns().subscribe(this.processColumns.bind(this));
  }

  ngAfterViewInit () {
    this._rows.paginator = this.paginator;
    this._rows.sort = this.sort;
  }

  public setSelectedTags (values: SelectedTags) {
    this._searchSettingsService.setSelectedTags(values);

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
    this._dialog.open(SearchResultAddColumnsModalComponent, {
      data: {
        allColumns: this._allColumns,
        displayedColumns: this._searchSettingsService.getVisibleColumns()
      } as AddColumnsModalData
    });
  }

  public showDetails (row: SearchRow) {
    this._dialog.open(SearchResultDetailsModalComponent, {
      width: '98%',
      data: row
    });
  }

  public getFilter (column: string): string {
    const value = this._filter[ column ];
    return isNullOrUndefined(value) ? '' : value;
  }

  public setFilter (filterValue: string, column: string): void {
    if (!filterValue) {
      // remove key `column`
      // delete this.filter[column] does not work (and may be slow on certain engines)
      this._filter = Object.keys(this._filter).reduce((result, key) => {
        if (key !== column) {
          result[ key ] = this._filter[ key ];
        }
        return result;
      }, {}) as Map<string, string>;
    } else {
      this._filter[ column ] = filterValue.trim();
    }

    this._filterAsRegex = new Map<string, RegExp>();
    Object.keys(this._filter).map(key =>
      this._filterAsRegex[ key ] = new RegExp(this._filter[ key ], 'i'));

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
    this._searchSettingsService.setPaginatorPageSize(event.pageSize);
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
    const filterKeys = Object.keys(this._filter);
    // prevent dereference array every iteration
    const filterKeyLength = filterKeys.length;

    const rows = [];

    // This loop here is probably slow, however it should be fast ...
    let counter = 0;
    for (let i = 0; i < this._allRows.length; ++i) {
      let isValid = true;

      // Check all filters. All filters need to match.
      for (let j = 0; j < filterKeyLength; ++j) {
        const key = filterKeys[ j ];
        const value = this._allRows[ i ][ filterKeys[ j ] ];
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
              this._filter[ key ],
              this._filterAsRegex[ key ])) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid) {
        // .push( ... ) is slow:
        // https://jsperf.com/push-allocated-vs-dynamic
        rows[ counter++ ] = this._allRows[ i ];
      }
    }

    this._rows.data = rows;
  }

  private clearFilters (): void {
    this._filter = new Map<string, string>();
    this._filterAsRegex = new Map<string, RegExp>();

    if (this._searchSettingsService.isReady) {
      this.setSelectedTags(this._searchSettingsService.getSelectedTags());
    }
  }

  private processColumns (columns: ColumnsResponse): void {
    this._allColumns = columns;
  }

  private processRows (result: SearchResponse): void {
    if (isNullOrUndefined(result)) {
      return;
    }

    // process result

    this._totalRows = result.total_rows;
    this._allRows = result.rows;

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
