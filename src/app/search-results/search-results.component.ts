import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api-service';
import { ColumnsResponse } from '../api/response/columns-response';
import { SearchResponse } from '../api/response/search-reponse';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SearchResultDetailsModalComponent } from './search-result-details-modal/search-result-details-modal.component';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss' ]
})
export class SearchResultsComponent implements OnInit {
  public rows = new MatTableDataSource();

  public visibleColumns = [
    'phdmxin_time',
    'sender',
    'recipient'
  ];

  public get visibleColumnsWithMetadata (): Array<string> {
    return [ 'details', ...this.visibleColumns ];
  }

  private totalRows: number;
  private allColumns: Array<string>;

  constructor (private apiService: ApiService,
               private dialog: MatDialog) {
  }

  ngOnInit () {
    this.apiService.getColumns().then(this.processColumns.bind(this));

    const builder = this.apiService.getRequestBuilder();
    builder.setEndpoint(new SearchEndpoint(0, 1000));
    builder.setCallback(this.processRows.bind(this));

    this.apiService.SubmitRequest(builder.build());
  }

  public showDetails (row: any) {
    this.dialog.open(SearchResultDetailsModalComponent, {
      width: '80%',
      data: row
    });
  }

  private processColumns (columns: ColumnsResponse): void {
    this.allColumns = columns;
  }

  private processRows (result: SearchResponse): void {
    this.totalRows = result.total_rows;
    this.rows.data = result.rows;
  }
}
