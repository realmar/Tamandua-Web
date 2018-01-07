import { AfterContentChecked, AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { SearchFieldData } from '../search-field/search-field-data';
import { ApiService } from '../api/api-service';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SearchStateService } from '../search-state-service/search-state.service';

/*
 * Design: query parameters for search query:
 * This is not really "scalable" as the url is limited to 2083 characters
 *
 * {
 *    data: <filter-as-json-string>
 * }
 *
 * where <filter-as-json-string> is a serialized intermediate expression
 */

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
})
export class SearchComponent implements OnInit, AfterViewInit, AfterContentInit {
  private _startDateTime: Date;
  set startDateTime (value: Date) {
    this._startDateTime = value;
    this.searchState.startDatetime = value;
  }

  get startDateTime (): Date {
    return this._startDateTime;
  }

  private _endDateTime: Date;
  set endDateTime (value: Date) {
    this._endDateTime = value;
    this.searchState.endDatetime = value;
  }

  get endDateTime (): Date {
    return this._endDateTime;
  }

  private _fields: Array<SearchFieldData>;
  get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  private _initStartDateTime: Date;
  private _initEndDateTime: Date;

  constructor (private apiService: ApiService,
               private searchState: SearchStateService,
               private route: ActivatedRoute) {
    this._initStartDateTime = this.searchState.startDatetime;
    this._initEndDateTime = this.searchState.endDatetime;
  }

  ngOnInit () {
    // restore state
    if (isNullOrUndefined(this.searchState.fields)) {
      this.searchState.fields = [ new SearchFieldData() ];
    }

    this._fields = this.searchState.fields;
    this.applyIntialDatetime();

    this.route.queryParams.subscribe(params => {
      if (isNullOrUndefined(params.data)) {
        return;
      }

      console.log(JSON.parse(params.data));
    });
  }

  ngAfterViewInit () {

  }

  ngAfterContentInit () {
    this.applyIntialDatetime();
  }

  public anyFieldsEmpty (): boolean {
    return this._fields.some(element => element.value.trim().length === 0);
  }

  public addField (): void {
    if (this.anyFieldsEmpty()) {
      return;
    }

    this._fields.push(new SearchFieldData());
  }

  public isOnlyField (): boolean {
    return this._fields.length < 2;
  }

  public removeField (field: SearchFieldData): void {
    if (this.isOnlyField()) {
      return;
    }

    const index = this._fields.indexOf(field);
    this._fields.splice(index, 1);
  }

  public search (): void {
    // make request

    const builder = this.apiService.getRequestBuilder();

    builder.setCallback(result => console.log(result));
    builder.setEndpoint(new SearchEndpoint(0, 1000));
    builder.setStartDatetime(this._startDateTime);
    builder.setEndDatetime(this._endDateTime);

    for (const field of this._fields) {
      builder.addField(field.field, field.value, field.comparator);
    }

    this.apiService.SubmitRequest(builder.build());
  }

  private applyIntialDatetime (): void {
    this.startDateTime = this._initStartDateTime;
    this.endDateTime = this._initEndDateTime;
  }
}
