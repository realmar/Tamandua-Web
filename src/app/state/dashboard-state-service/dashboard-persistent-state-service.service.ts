import { Injectable } from '@angular/core';
import { DashboardStateService } from './dashboard-state.service';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';

@Injectable()
export class DashboardPersistentStateServiceService extends DashboardStateService {
  constructor (private storage: PersistentStorageService) {
    super();

    this.getData('dashboard_pastHours', result => this.setPastHours(result));
    this.getData('dashboard_MaxItemCountPerCard', result => this.setMaxItemCountPerCard(result));
    this.getData('dashboard_RefreshInterval', result => this.setRefreshInterval(result));
  }

  private getData (key: string, setter: (data: any) => void) {
    this.storage.load(key).subscribe(result => {
      if (!isNullOrUndefined(result)) {
        setter(result);
      }
    });
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
