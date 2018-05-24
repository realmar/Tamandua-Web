import { Injectable, Type } from '@angular/core';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { isNullOrUndefined } from '../../../utils/misc';
import { InitializationCounter } from './initialization-counter';

@Injectable()
export class SettingsUtilsService {
  public constructor (private _storage: PersistentStorageService) {
  }

  public getData<T> (key: string,
                     type: Type<T>,
                     setter: (value: T) => void,
                     counter: InitializationCounter): void {

    this._storage.load(type, key).subscribe(value => {
      if (!isNullOrUndefined(value)) {
        setter(value);
      }
      counter.increment();
    });
  }
}
