import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api-service';
import { ColumnsResponse } from '../api/response/columns-response';
import { SearchResponse, SearchRow } from '../api/response/search-reponse';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { SearchResultDetailsModalComponent } from './search-result-details-modal/search-result-details-modal.component';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss' ]
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  private _rows = new MatTableDataSource<SearchRow>();

  public get rows (): MatTableDataSource<SearchRow> {
    return this._rows;
  }

  private _visibleColumns = [
    'phdmxin_time',
    'sender',
    'recipient',
    'spamscore'
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

  constructor (private apiService: ApiService,
               private dialog: MatDialog) {
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

  public showDetails (row: any) {
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

    this.updateFilter();
  }

  private updateFilter (): void {
    // This needs to be ultra fast ... needs further investigation

    // prevent key evaluation for every row
    const filterKeys = Object.keys(this.filter);
    // prevent dereference array every iteration
    const filterKeyLength = filterKeys.length;

    const filterAsRegex = new Map<string, string>();

    filterKeys.map(key =>
      filterAsRegex[ key ] = new RegExp(this.filter[ key ], 'i'));

    const rows = new Array<SearchRow>();

    const typeCompareFunctions = {
      'number': function (value: number, filter: string, regexFilter: RegExp): boolean {

        if (filter.startsWith('>=')) {
          return value >= parseFloat(filter.slice(2, filter.length));
        }

        if (filter.startsWith('<=')) {
          return value <= parseFloat(filter.slice(2, filter.length));
        }

        if (filter.startsWith('>')) {
          return value > parseFloat(filter.slice(1, filter.length));
        }

        if (filter.startsWith('<')) {
          return value < parseFloat(filter.slice(1, filter.length));
        }

        return value === parseFloat(filter);
      },

      'string': function (value: string, filter: string, regexFilter: RegExp): boolean {
        return regexFilter.test(value);
      },

      'object': function (value: object, filter: string, regexFilter: RegExp): boolean {
        return !value;
      }
    };

    for (let i = 0; i < this.allRows.length; ++i) {
      let isValid = true;

      for (let j = 0; j < filterKeyLength; ++j) {
        const key = filterKeys[ j ];
        const value = this.allRows[ i ][ filterKeys[ j ] ];

        if (!typeCompareFunctions[ typeof(value) ](
            value,
            this.filter[ key ],
            filterAsRegex[ key ])) {

          isValid = false;
          break;
        }
      }

      if (isValid) {
        rows.push(this.allRows[ i ]);
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
  }
}
