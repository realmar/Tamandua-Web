import { Injectable, Type } from '@angular/core';
import { CachedTamanduaService } from './cached-tamandua.service';
import { PersistentStorageService } from '../persistence/persistent-storage-service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import 'rxjs/add/observable/throw';
import { isNullOrUndefined } from 'util';
import { DataCache } from './data-cache';
import { Subject } from 'rxjs/Subject';

interface DataCacheMetaData {
  key: string;
  cacheSetter: (data: any) => void;
  needsPersistence: boolean;
  type: Type<any>;
}

enum CachedKeys {
  Columns, Tags, FieldChoices, SupportedFieldChoices
}

@Injectable()
export class PersistentCachedTamanduaService extends CachedTamanduaService {
  private readonly dataCacheMetaData = new Map<CachedKeys, DataCacheMetaData>([
    [ CachedKeys.Columns, {
      key: 'api_columns',
      cacheSetter: data => this.columnsCache = data,
      needsPersistence: true,
      type: DataCache
    } ],
    [ CachedKeys.Tags, {
      key: 'api_tags',
      cacheSetter: data => this.tagsCache = data,
      needsPersistence: true,
      type: DataCache
    } ],
    [ CachedKeys.FieldChoices, {
      key: 'api_field_choices',
      cacheSetter: data => this.fieldChoiceCaches = data,
      needsPersistence: true,
      type: Map
    } ],
    [ CachedKeys.SupportedFieldChoices, {
      key: 'api_supported_field_choices',
      cacheSetter: data => this.supportedFieldChoicesCache = data,
      needsPersistence: true,
      type: DataCache
    } ],
  ]);

  private _isReady: boolean;
  private _onReadySubject: Subject<any>;
  private _onReady: Observable<any>;

  constructor (private storage: PersistentStorageService, httpClient: HttpClient) {
    super(httpClient);

    this._isReady = false;
    this._onReadySubject = new Subject<any>();
    this._onReady = this._onReadySubject.asObservable();

    let dataCounter = 0;

    this.dataCacheMetaData
      .forEach(value => {
        this.storage.load<any>(value.type, value.key).subscribe(
          result => {
            let isValid = true;
            if (result instanceof DataCache) {
              isValid = result.isValid;
            }

            if (isNullOrUndefined(result) || !isValid) {
              value.needsPersistence = true;
              return;
            }

            value.needsPersistence = false;
            value.cacheSetter(result);

            dataCounter++;
            if (dataCounter === this.dataCacheMetaData.size) {
              this._isReady = true;
              this._onReadySubject.next();
            }
          });
      });
  }

  private getData<T> (metadataKey: CachedKeys, cache: DataCache<T>, dataGetter: () => Observable<T>) {
    const subject = new Subject<T>();

    const transaction = () => {
      const metaData = this.dataCacheMetaData.get(metadataKey);
      if (!cache.isValid) {
        metaData.needsPersistence = true;
      }

      const result = dataGetter();
      result.subscribe(data => {
        if (metaData.needsPersistence) {
          this.storage.save(metaData.key, cache);
        }

        subject.next(data);
      });
    };

    if (!this._isReady) {
      this._onReady.subscribe(() => transaction());
    } else {
      transaction();
    }

    return subject.asObservable();
  }

  public getColumns (): Observable<ColumnsResponse> {
    return this.getData(CachedKeys.Columns, this.columnsCache, super.getColumns.bind(this));
  }

  public getTags (): Observable<TagsResponse> {
    return this.getData(CachedKeys.Tags, this.tagsCache, super.getTags.bind(this));
  }

  public getFieldChoices (field: string, limit: number): Observable<FieldChoicesResponse> {
    const subject = new Subject<FieldChoicesResponse>();

    const transaction = () => {
      const cache = this.fieldChoiceCaches;
      let needsPersistence = false;
      if (isNullOrUndefined(cache) || !Array.from(cache.values()).some(x => x.isValid)) {
        this.dataCacheMetaData.get(CachedKeys.FieldChoices).needsPersistence = true;
        needsPersistence = true;
      }

      const result = super.getFieldChoices(field, limit);
      result.subscribe(data => {
        if (needsPersistence) {
          const metadata = this.dataCacheMetaData.get(CachedKeys.FieldChoices);
          this.storage.save(metadata.key, this.fieldChoiceCaches);
        }

        subject.next(data);
      });
    };

    if (!this._isReady) {
      this._onReady.subscribe(() => transaction());
    } else {
      transaction();
    }

    return subject.asObservable();
  }

  public getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse> {
    return this.getData(CachedKeys.SupportedFieldChoices, this.supportedFieldChoicesCache, super.getSupportedFieldChoices.bind(this));
  }
}
