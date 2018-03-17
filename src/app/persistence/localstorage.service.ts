import { Injectable, Type } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { deserialize, serialize } from 'class-transformer';

@Injectable()
export class LocalstorageService implements PersistentStorageService {
  public save (key: string, obj: any): void {
    const serialized = serialize(obj);
    localStorage.setItem(key, serialized);
  }

  public load<T> (type: Type<T>, key: string): Observable<T> {
    return of(deserialize(type, localStorage.getItem(key)));
  }
}
