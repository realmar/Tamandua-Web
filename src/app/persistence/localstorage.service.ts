import { Injectable, Type } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { plainToClass } from 'class-transformer';

@Injectable()
export class LocalstorageService implements PersistentStorageService {
  public save (key: string, obj: any): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  public load<T> (type: Type<T>, key: string): Observable<T> {
    const rawObj = JSON.parse(localStorage.getItem(key)) as T;
    const obj = plainToClass(type, rawObj);

    return of(obj);
  }
}
