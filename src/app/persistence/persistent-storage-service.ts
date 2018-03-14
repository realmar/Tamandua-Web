import { Observable } from 'rxjs/Observable';

export abstract class PersistentStorageService {
  public abstract save (key: string, obj: any): void;

  public abstract load<T> (key: string): Observable<T>;
}
