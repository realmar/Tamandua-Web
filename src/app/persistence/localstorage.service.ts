import { Injectable } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class LocalstorageService implements PersistentStorageService {
  public save (key: string, obj: any): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  public load<T> (key: string): Observable<T> {
    return of(JSON.parse(localStorage.getItem(key)));
  }
}
