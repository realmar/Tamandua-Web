import { Injectable, Type } from '@angular/core';
import { CachedTamanduaService, FieldChoicesCache } from './cached-tamandua.service';
import { PersistentStorageService } from '../persistence/persistent-storage-service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { isNullOrUndefined } from '../utils/misc';
import { TimedDataCache } from './cache/timed-data-cache';
import { DataCache } from './cache/data-cache';

interface DataCacheMetaData {
  readonly key: string;
  readonly cacheSetter: (data: any) => void;
  needsPersistence: boolean;
  readonly type: Type<any>;
}

enum CachedKeys {
  Columns, Tags, FieldChoices, SupportedFieldChoices
}

@Injectable()
export class PersistentCachedTamanduaService extends CachedTamanduaService {
  private readonly _dataCacheMetaData = new Map<CachedKeys, DataCacheMetaData>([
    [ CachedKeys.Columns, {
      key: 'api_columns',
      cacheSetter: data => this.columnsCache = data,
      needsPersistence: true,
      type: TimedDataCache
    } ],
    [ CachedKeys.Tags, {
      key: 'api_tags',
      cacheSetter: data => this.tagsCache = data,
      needsPersistence: true,
      type: TimedDataCache
    } ],
    [ CachedKeys.FieldChoices, {
      key: 'api_field_choices',
      cacheSetter: data => this.setDeserializedFieldChoiceCaches(data),
      needsPersistence: true,
      type: TimedDataCache
    } ],
    [ CachedKeys.SupportedFieldChoices, {
      key: 'api_supported_field_choices',
      cacheSetter: data => this.supportedFieldChoicesCache = data,
      needsPersistence: true,
      type: TimedDataCache
    } ],
  ]);

  private _isReady: boolean;
  private _onReadySubject: Subject<any>;
  private _onReady: Observable<any>;

  constructor (private _storage: PersistentStorageService, httpClient: HttpClient) {
    super(httpClient);

    this._isReady = false;
    this._onReadySubject = new Subject<any>();
    this._onReady = this._onReadySubject.asObservable();

    let dataCounter = 0;

    this._dataCacheMetaData
      .forEach(value => {
        this._storage.load<any>(value.type, value.key).subscribe(
          result => {
            let isValid = true;
            if (result instanceof DataCache) {
              isValid = result.isValid;
            }

            if (isNullOrUndefined(result) || !isValid) {
              value.needsPersistence = true;
            } else {
              value.needsPersistence = false;
              value.cacheSetter(result);
            }

            dataCounter++;
            if (dataCounter === this._dataCacheMetaData.size) {
              this._isReady = true;
              this._onReadySubject.next();
            }
          });
      });
  }

  private getData<T> (metadataKey: CachedKeys, cacheGetter: () => DataCache<T>, dataGetter: () => Observable<T>) {
    const subject = new Subject<T>();
    let resultObservable: Observable<T>;

    const transaction = () => {
      const metaData = this._dataCacheMetaData.get(metadataKey);
      if (!cacheGetter().isValid) {
        metaData.needsPersistence = true;
      }

      const result = dataGetter();
      resultObservable = result;

      result.subscribe(data => {
        if (metaData.needsPersistence) {
          cacheGetter().data = data;
          this._storage.save(metaData.key, cacheGetter());
        }

        subject.next(data);
      });
    };

    if (!this._isReady) {
      this._onReady.subscribe(() => transaction());
    } else {
      transaction();
    }

    return isNullOrUndefined(resultObservable) ? subject.asObservable() : resultObservable;
  }

  private setDeserializedFieldChoiceCaches (fieldChoices: Array<DataCache<FieldChoicesCache>>): void {
    const fieldChoicesMap = new Map<string, DataCache<FieldChoicesCache>>();
    fieldChoices.forEach(cache => fieldChoicesMap.set(cache.data.field, cache));
    this.fieldChoiceCaches = fieldChoicesMap;
  }

  public getColumns (cancellationToken?: Observable<any>): Observable<ColumnsResponse> {
    return this.getData(CachedKeys.Columns, () => this.columnsCache, () => super.getColumns(cancellationToken));
  }

  public getTags (cancellationToken?: Observable<any>): Observable<TagsResponse> {
    return this.getData(CachedKeys.Tags, () => this.tagsCache, () => super.getTags(cancellationToken));
  }

  public getFieldChoices (field: string, limit?: number, cancellationToken?: Observable<any>): Observable<FieldChoicesResponse> {
    const subject = new Subject<FieldChoicesResponse>();
    let resultObservable: Observable<FieldChoicesResponse>;

    const transaction = () => {
      const cache = this.fieldChoiceCaches;
      let needsPersistence = false;
      if (isNullOrUndefined(cache) || !Array.from(cache.values()).some(x => x.isValid)) {
        this._dataCacheMetaData.get(CachedKeys.FieldChoices).needsPersistence = true;
        needsPersistence = true;
      }

      const result = super.getFieldChoices(field, limit, cancellationToken);
      resultObservable = result;

      result.subscribe(data => {
        if (needsPersistence) {
          const fcCache = this.getOrCreateFieldChoiceCache(field);
          fcCache.data.response = data;

          const metadata = this._dataCacheMetaData.get(CachedKeys.FieldChoices);
          this._storage.save(metadata.key, this.fieldChoiceCaches.valuesToArray());
        }

        subject.next(data);
      });
    };

    if (!this._isReady) {
      this._onReady.subscribe(() => transaction());
    } else {
      transaction();
    }

    return isNullOrUndefined(resultObservable) ? subject.asObservable() : resultObservable;
  }

  public getSupportedFieldChoices (cancellationToken?: Observable<any>): Observable<SupportedFieldchoicesResponse> {
    return this.getData(
      CachedKeys.SupportedFieldChoices,
      () => this.supportedFieldChoicesCache,
      () => super.getSupportedFieldChoices(cancellationToken));
  }

  public invalidateAllCaches (): void {
    super.invalidateAllCaches();

    this._dataCacheMetaData.forEach(value => this._storage.delete(value.key));
  }
}
