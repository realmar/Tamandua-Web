import { Observable } from 'rxjs';
import { Type } from '@angular/core';

export abstract class PersistentStorageService {
  public abstract save (key: string, obj: any): void;

  public abstract load<T> (type: Type<T>, key: string): Observable<T>;

  public abstract delete (key: string): void;
}
