import { Component, OnInit } from '@angular/core';
import { SettingValidationResult } from '../../settings/setting-validation-result';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-dashboard-settings',
  templateUrl: './dashboard-settings.component.html',
  styleUrls: [ './dashboard-settings.component.scss' ]
})
export class DashboardSettingsComponent implements OnInit {

  private _pastHoursValidationSubject: Subject<SettingValidationResult>;
  private _maxItemCountValidationSubject: Subject<SettingValidationResult>;
  private _intervalValidationSubject: Subject<SettingValidationResult>;

  public get pastHoursCount (): number {
    return this._dashboardSettingsService.getPastHours();
  }

  public set pastHoursCount (value: number) {
    this._pastHoursValidationSubject.next(this._dashboardSettingsService.setPastHours(value));
  }

  public get maxItemCountPerCard (): number {
    return this._dashboardSettingsService.getMaxItemCountPerCard();
  }

  public set maxItemCountPerCard (value: number) {
    this._maxItemCountValidationSubject.next(this._dashboardSettingsService.setMaxItemCountPerCard(value));
  }

  public get refreshInterval (): number {
    return this._dashboardSettingsService.getRefreshInterval() / 1000;
  }

  public set refreshInterval (value: number) {
    this._intervalValidationSubject.next(this._dashboardSettingsService.setRefreshInterval(value * 1000));
  }

  public get pastHoursValidationObservable (): Observable<SettingValidationResult> {
    return this._pastHoursValidationSubject.asObservable();
  }

  public get maxItemCountValidationObservable (): Observable<SettingValidationResult> {
    return this._maxItemCountValidationSubject.asObservable();
  }

  public get intervalValidationObservable (): Observable<SettingValidationResult> {
    return this._intervalValidationSubject.asObservable();
  }


  constructor (private _dashboardSettingsService: DashboardSettingsService) {
    this._pastHoursValidationSubject = new Subject<SettingValidationResult>();
    this._maxItemCountValidationSubject = new Subject<SettingValidationResult>();
    this._intervalValidationSubject = new Subject<SettingValidationResult>();
  }

  ngOnInit () {
  }

}
