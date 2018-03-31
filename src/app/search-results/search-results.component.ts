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
import { ToastrUtils } from '../utils/toastr-utils';
import { ToastrService } from 'ngx-toastr';

interface TypeComparatorArguments {
  key: string;
  value: any;
  filter: string;
  regexFilter: RegExp;
}

type TypeComparator = (args: TypeComparatorArguments) => boolean;

interface TypeComparatorMap {
  [ index: string ]: TypeComparator;
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss' ]
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  @Input()
  public set searchResult (value: SearchResponse) {
    this.clearFilters();
    this.processRows(value);
  }

  private _dataSource: TamanduaTableDataSource<SearchRow>;
  public get dataSource (): TamanduaTableDataSource<SearchRow> {
    return this._dataSource;
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

  private readonly typeCompareFunctionMap: TypeComparatorMap = {
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
               private _dialog: MatDialog,
               private _toastr: ToastrService) {
    this._onFilterChange = new Subject<any>();
    this._onFilterChange
      .asObservable()
      .pipe(
        debounceTime(500),
      ).subscribe(() => this.updateFilter());

    this._dataSource = new TamanduaTableDataSource<SearchRow>();
    this._allRows = [];
    this._allColumns = [];

    this.clearFilters();
  }

  ngOnInit () {
    this._apiService.getColumns().subscribe(
      data => {
        ToastrUtils.removeAllGenericServerErrors(this._toastr);
        this.processColumns(data);
      },
      () => ToastrUtils.showGenericServerError(this._toastr)
    );
  }

  ngAfterViewInit () {
    this._sort.disableClear = true;
    this._dataSource.paginator = this._paginator;
    this._dataSource.sort = this._sort;
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
    const value = this._filter.get(column);
    return isNullOrUndefined(value) ? '' : value;
  }

  public setFilter (filterValue: string, column: string): void {
    if (!filterValue) {
      this._filter.delete(column);
    } else {
      this._filter.set(column, filterValue.trim());
    }

    this._filterAsRegex = new Map<string, RegExp>();
    this._filter.forEach(
      (value, key) => this._filterAsRegex.set(key, new RegExp(this._filter.get(key), 'i')));

    // this.updateFilter();
    this._onFilterChange.next();
  }

  public generateSaveDataObject (): SaveObjectData {
    const data = new Map<string, any>();
    data.set('dataSource', this._dataSource.data);

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

  private compareNumber (args: TypeComparatorArguments): boolean {
    return SearchResultsComponent.genericCompare<number>(args.value, args.filter, parseFloat);
  }

  private compareString (args: TypeComparatorArguments): boolean {
    return args.regexFilter.test(args.value);
  }

  private compareArray (args: TypeComparatorArguments): boolean {
    // only | connective is supported atm

    let isValid = false;

    const expressionParts = args.filter.split('|');
    for (let i = 0; i < expressionParts.length; i++) {
      let isMatch = false;

      for (let j = 0; j < args.value.length; j++) {
        const part = expressionParts[ i ].trim();

        const comparatorName = this.isKeyDatetime(args.key) ? 'datetime' : typeof(args.value[ j ]);
        const comparatorArguments = {
          key: args.key,
          value: args.value[ j ],
          filter: part,
          regexFilter: new RegExp(part)
        };

        isMatch = this.typeCompareFunctionMap[ comparatorName ](comparatorArguments);

        if (isMatch) {
          break;
        }
      }

      isValid = isValid || isMatch;
    }

    return isValid;
  }

  private compareObject (args: TypeComparatorArguments): boolean {
    console.warn('The type ' + args.value.constructor.name + ' does not have a specific compare function. ' +
      'You should implement one. (Otherwise the object cannot be compared --> as long as it is ' +
      'not null or undefined, true is returned.)');
    return !args.value;
  }

  private compareDatetime (args: TypeComparatorArguments): boolean {
    let finalValue = args.value;
    const stripedFilter = args.filter.replace(/^(>=|<=|<|>)/, '');

    if (Converter.isStringTimeOnly(stripedFilter)) {
      finalValue = args.value.substring(args.value.indexOf(' ') + 1, args.value.length);
    } else if (Converter.isStringDateOnly(stripedFilter)) {
      finalValue = args.value.substring(0, args.value.indexOf(' '));
    }

    return SearchResultsComponent.genericCompare<number>(
      Converter.stringToDate(finalValue).getTime(),
      args.filter,
      f => Converter.stringToDate(f).getTime());
  }

  private compareUndefined (args: TypeComparatorArguments): boolean {
    // exclude undefined values from filter results
    return false;
  }

  private compareNull (args: TypeComparatorArguments): boolean {
    // exclude null values from filter results
    return false;
  }

  private isKeyDatetime (key: string): boolean {
    try {
      return key.slice(key.length - 4, key.length) === 'time';
    } catch (e) {
      console.log(e);
    }
  }

  private updateFilter (): void {
    // This needs to be ultra fast ... needs further investigation

    // prevent key evaluation for every row
    const filterKeys = Array.from(this._filter.keys()) as Array<string>;
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
        const value = this._allRows[ i ][ key ];
        let typeStr: string;

        if (value instanceof Array) {
          typeStr = 'array';
        } else if (this.isKeyDatetime(key)) {
          typeStr = 'datetime';
        } else {
          typeStr = typeof(value);
        }

        const comparer = this.typeCompareFunctionMap[ typeStr ];
        if (isNullOrUndefined(comparer)) {
          console.warn(`No comparator found for type: ${typeStr} while filtering table.`);
        } else {
          const comparatorArguments = {
            key: key,
            value: value,
            filter: this._filter.get(key),
            regexFilter: this._filterAsRegex.get(key)
          };
          if (!comparer(comparatorArguments)) {
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

    this._dataSource.data = rows;
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

    if (isNullOrUndefined(this._dataSource.sort)) {
      return;
    }

    let initialSortKey = 'phdmxin_time';
    if (!this._sort.sortables.has(initialSortKey)) {
      initialSortKey = this._sort.sortables.keys().next().value;
    }

    this._sort.active = initialSortKey;
    this._sort.direction = 'asc';

    this._sort.sort({
      id: initialSortKey,
      start: 'desc',
      disableClear: true
    });
  }
}
