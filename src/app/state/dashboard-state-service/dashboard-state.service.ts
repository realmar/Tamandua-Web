import { Injectable } from '@angular/core';

@Injectable()
export class DashboardStateService {
  private _pastHours: number;

  get pastHours (): number {
    return this._pastHours;
  }

  set pastHours (value: number) {
    this._pastHours = value;
  }
}
