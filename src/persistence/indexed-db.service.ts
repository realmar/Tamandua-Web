import { Injectable, Type } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';
import { Observable, Subject } from 'rxjs';
import Dexie from 'dexie';
import { isNullOrUndefined } from '../utils/misc';
import { classToPlain, plainToClass } from 'class-transformer';

interface TamanduaStore {
  readonly key: string;
  readonly obj: any;
}

class TamanduaDexie extends Dexie {
  // needs to be public: Dexie specification
  public store: Dexie.Table<TamanduaStore, number>;

  public constructor (dbName: string) {
    super(dbName);

    this.version(1).stores({
      store: 'key'
    });

    this.version(2).stores({
      store: 'key'
    }).upgrade(trans => {
      (trans as any).store.toCollection().modify(obj => {
        if (obj.key === 'dashboard_Cards') {
          const data = obj.obj;
          const upgraded = data.map(value => {
            return {
              isSummaryCard: false,
              cardRow: value
            };
          });
          upgraded.insert(0, {
            isSummaryCard: true,
            cardRow: undefined
          });

          Object.assign(obj.obj, upgraded);
        }
      });
    });
  }
}

@Injectable()
export class IndexedDbService implements PersistentStorageService {
  private readonly _dbName = 'tamandua';
  private readonly _db: TamanduaDexie;

  public constructor () {
    this._db = new TamanduaDexie(this._dbName);
  }

  public save (key: string, obj: any): void {
    this._db.transaction('rw', this._db.store, () => {
      const transformedObj = classToPlain(obj);
      this._db.store.put({ key: key, obj: transformedObj });
    });
  }

  public load<T> (type: Type<T>, key: string): Observable<T> {
    const subject = new Subject<T>();

    this._db.transaction('rw', this._db.store, () => {
      this._db.store.where('key').equals(key).first().then(result => {
        let obj: T;
        if (!isNullOrUndefined(result)) {
          obj = plainToClass<T, T>(type, result.obj);
        }

        subject.next(obj);
      });
    });

    return subject.asObservable();
  }

  public delete (key: string): void {
    this._db.transaction('rw', this._db.store, () => {
      this._db.store.where('key').equals(key).delete();
    });
  }
}
