import { Injectable } from '@angular/core';

interface DashboardSettings {
  readonly maxItemCountPerCard: number;
  /**
   * Refresh interval of dashboard in milliseconds.
   */
  readonly refreshInterval: number;
}

@Injectable()
export class SettingsService {
  private _dashboard: DashboardSettings;
  get dashboard (): DashboardSettings {
    return this._dashboard;
  }

  constructor () {
    this._dashboard = {
      maxItemCountPerCard: 10,
      refreshInterval: 10000
    };
  }
}
