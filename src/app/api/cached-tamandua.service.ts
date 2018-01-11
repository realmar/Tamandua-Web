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

@Injectable()
export class CachedTamanduaService extends TamanduaService {

  private _columnsCache: DataCache<ColumnsResponse>;
  private _tagsCache: DataCache<TagsResponse>;

  constructor (httpClient: HttpClient) {
    super(httpClient);

    this._columnsCache = new DataCache<ColumnsResponse>();
    this._tagsCache = new DataCache<TagsResponse>();
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
}
