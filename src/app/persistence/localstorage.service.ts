import { Injectable } from '@angular/core';
import { PersistentStorageService } from './persistent-storage-service';

@Injectable()
export class LocalstorageService implements PersistentStorageService {
  public save (key: string, obj: any): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  public load<T> (key: string, callback: (result: T, success: boolean) => void): void {
    callback(JSON.parse(localStorage.getItem(key)), true);
  }
}
