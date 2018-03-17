import { Injectable, Type } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';
import { Observable } from 'rxjs/Observable';
import Dexie from 'dexie';
import { Subject } from 'rxjs/Subject';
import { isNullOrUndefined } from 'util';
import { plainToClass } from 'class-transformer';

interface TamanduaStore {
  key: string;
  obj: any;
}

class TamanduaDexie extends Dexie {
  // needs to be public: Dexie specification
  public store: Dexie.Table<TamanduaStore, number>;

  public constructor (dbName: string) {
    super(dbName);

    this.version(1).stores({
      store: 'key,obj'
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
      this._db.store.put({ key: key, obj: obj });
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
}
