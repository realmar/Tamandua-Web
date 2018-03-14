import { Injectable } from '@angular/core';
import { TamanduaService } from './tamandua.service';
import { Observable } from 'rxjs/Observable';
import { ColumnsResponse } from './response/columns-response';
import { DataCache } from './data-cache';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { of } from 'rxjs/observable/of';
import { ApiResponse } from './response/api-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';

interface FieldChoicesCache {
  readonly limit: number;
  readonly field: string;

  readonly response: FieldChoicesResponse;
}

@Injectable()
export class CachedTamanduaService extends TamanduaService {
  private _columnsCache: DataCache<ColumnsResponse>;
  private _tagsCache: DataCache<TagsResponse>;

  private _fieldChoiceCaches: Map<string, DataCache<FieldChoicesCache>>;
  private _supportedFieldChoicesCache: DataCache<SupportedFieldchoicesResponse>;

  protected get columnsCache (): DataCache<ColumnsResponse> {
    return this._columnsCache;
  }

  protected get tagsCache (): DataCache<TagsResponse> {
    return this._tagsCache;
  }

  protected get fieldChoiceCaches (): Map<string, DataCache<FieldChoicesCache>> {
    return this._fieldChoiceCaches;
  }

  protected get supportedFieldChoicesCache (): DataCache<SupportedFieldchoicesResponse> {
    return this._supportedFieldChoicesCache;
  }

  constructor (httpClient: HttpClient) {
    super(httpClient);

    this._columnsCache = new DataCache<ColumnsResponse>();
    this._tagsCache = new DataCache<TagsResponse>();

    this._fieldChoiceCaches = new Map<string, DataCache<FieldChoicesCache>>();
    this._supportedFieldChoicesCache = new DataCache<SupportedFieldchoicesResponse>();
  }

  private cacheGeneric<T extends ApiResponse> (cache: DataCache<T>, dataFunction: () => Observable<T>): Observable<T> {
    if (!isNullOrUndefined(cache.data) && cache.isValid) {
      return of(cache.data);
    }

    const result = dataFunction();
    result.subscribe(data => cache.data = data);

    return result;
  }

  public getColumns (): Observable<ColumnsResponse> {
    return this.cacheGeneric(this._columnsCache, super.getColumns.bind(this));
  }

  public getTags (): Observable<TagsResponse> {
    return this.cacheGeneric(this._tagsCache, super.getTags.bind(this));
  }

  public getFieldChoices (field: string, limit: number): Observable<FieldChoicesResponse> {
    let cache = this._fieldChoiceCaches.get(field);

    if (isNullOrUndefined(cache)) {
      cache = new DataCache<FieldChoicesCache>();
      this._fieldChoiceCaches.set(field, cache);
    }

    if (isNullOrUndefined(cache.data) || cache.data.field !== field || cache.data.limit !== limit) {
      cache.isValid = false;
    }

    if (cache.isValid) {
      return of(cache.data.response);
    } else {
      const result = super.getFieldChoices(field, limit);

      result.subscribe(function (response) {
        cache.isValid = true;
        cache.data = { limit: limit, field: field, response: response };
      }.bind(this));

      return result;
    }
  }

  public getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse> {
    return this.cacheGeneric(this._supportedFieldChoicesCache, super.getSupportedFieldChoices.bind(this));
  }
}
