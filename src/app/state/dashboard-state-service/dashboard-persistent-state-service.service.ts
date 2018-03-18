import { Injectable } from '@angular/core';
import { DashboardStateService } from './dashboard-state.service';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';

@Injectable()
export class DashboardPersistentStateServiceService extends DashboardStateService {
  private _retrievedDataCount: number;

  constructor (private storage: PersistentStorageService) {
    super();

    this._retrievedDataCount = 0;
    this.getData('dashboard_pastHours', result => this.setPastHours(result), () => this.emitPastHours());
    this.getData('dashboard_MaxItemCountPerCard', result => this.setMaxItemCountPerCard(result), () => this.emitMaxItemsCount());
    this.getData('dashboard_RefreshInterval', result => this.setRefreshInterval(result), () => this.emitRefreshInterval());
  }

  private getData (key: string, setter: (data: any) => void, callback: (data: any) => void) {
    this.storage.load(Number, key).subscribe(result => {
      if (!isNullOrUndefined(result) && result > 0) {
        setter(result);
      }

      callback(result);

      this._retrievedDataCount++;
      if (this._retrievedDataCount === 3) {
        this._isInitialized = true;
        this.onFinishInitalizeSubject.next();
      }
    });
  }

  protected emitFinishInitialize (): void {
    // do not emit
  }

  public setPastHours (value: number): void {
    super.setPastHours(value);
    this.storage.save('dashboard_pastHours', value);
  }

  public setMaxItemCountPerCard (value: number): void {
    super.setMaxItemCountPerCard(value);
    this.storage.save('dashboard_MaxItemCountPerCard', value);
  }

  public setRefreshInterval (value: number): void {
    super.setRefreshInterval(value);
    this.storage.save('dashboard_RefreshInterval', value);
  }
}
