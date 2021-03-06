import { Injectable } from '@angular/core';
import { TamanduaService } from './tamandua.service';
import { Observable, of } from 'rxjs';
import { ColumnsResponse } from './response/columns-response';
import { TimedDataCache } from './cache/timed-data-cache';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from '../utils/misc';
import { ApiResponse } from './response/api-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { DataCache } from './cache/data-cache';
import { CachedApiService } from './cached-api-service';

export interface FieldChoicesCache {
  readonly limit: number;
  readonly field: string;

  response: FieldChoicesResponse;
}

@Injectable()
export class CachedTamanduaService extends TamanduaService implements CachedApiService {
  private _columnsCache: DataCache<ColumnsResponse>;
  private _tagsCache: DataCache<TagsResponse>;

  private _fieldChoiceCaches: Map<string, DataCache<FieldChoicesCache>>;
  private _supportedFieldChoicesCache: DataCache<SupportedFieldchoicesResponse>;

  protected get columnsCache (): DataCache<ColumnsResponse> {
    return this._columnsCache;
  }

  protected set columnsCache (value: DataCache<ColumnsResponse>) {
    this._columnsCache = value;
  }

  protected get tagsCache (): DataCache<TagsResponse> {
    return this._tagsCache;
  }

  protected set tagsCache (value: DataCache<TagsResponse>) {
    this._tagsCache = value;
  }

  protected get fieldChoiceCaches (): Map<string, DataCache<FieldChoicesCache>> {
    return this._fieldChoiceCaches;
  }

  protected set fieldChoiceCaches (value: Map<string, DataCache<FieldChoicesCache>>) {
    this._fieldChoiceCaches = value;
  }

  protected get supportedFieldChoicesCache (): DataCache<SupportedFieldchoicesResponse> {
    return this._supportedFieldChoicesCache;
  }

  protected set supportedFieldChoicesCache (value: DataCache<SupportedFieldchoicesResponse>) {
    this._supportedFieldChoicesCache = value;
  }

  constructor (httpClient: HttpClient) {
    super(httpClient);
    this.createCaches();
  }

  private createCaches (): void {
    this._columnsCache = new TimedDataCache<ColumnsResponse>();
    this._tagsCache = new TimedDataCache<TagsResponse>();

    this._fieldChoiceCaches = new Map<string, TimedDataCache<FieldChoicesCache>>();
    this._supportedFieldChoicesCache = new TimedDataCache<SupportedFieldchoicesResponse>();
  }

  private cacheGeneric<T extends ApiResponse> (cache: DataCache<T>, dataFunction: () => Observable<T>): Observable<T> {
    if (!isNullOrUndefined(cache.data) && cache.isValid) {
      return of(cache.data);
    }

    const result = dataFunction();
    result.subscribe(data => cache.data = data);

    return result;
  }

  protected getOrCreateFieldChoiceCache (field: string): DataCache<FieldChoicesCache> {
    let cache = this._fieldChoiceCaches.get(field);

    if (isNullOrUndefined(cache)) {
      cache = new TimedDataCache<FieldChoicesCache>();
      this._fieldChoiceCaches.set(field, cache);
    }

    return cache;
  }

  public getColumns (cancellationToken?: Observable<any>): Observable<ColumnsResponse> {
    return this.cacheGeneric(this._columnsCache, () => super.getColumns(cancellationToken));
  }

  public getTags (cancellationToken?: Observable<any>): Observable<TagsResponse> {
    return this.cacheGeneric(this._tagsCache, () => super.getTags(cancellationToken));
  }

  public getFieldChoices (field: string, limit?: number, cancellationToken?: Observable<any>): Observable<FieldChoicesResponse> {
    const cache = this.getOrCreateFieldChoiceCache(field);

    if (isNullOrUndefined(cache.data) || cache.data.field !== field || cache.data.limit !== limit) {
      cache.invalidate();
    }

    if (cache.isValid) {
      return of(cache.data.response);
    } else {
      const result = super.getFieldChoices(field, limit, cancellationToken);

      result.subscribe(response => cache.data = { limit: limit, field: field, response: response });

      return result;
    }
  }

  public getSupportedFieldChoices (cancellationToken?: Observable<any>): Observable<SupportedFieldchoicesResponse> {
    return this.cacheGeneric(this._supportedFieldChoicesCache, () => super.getSupportedFieldChoices(cancellationToken));
  }

  public invalidateAllCaches (): void {
    this.createCaches();
  }
}
