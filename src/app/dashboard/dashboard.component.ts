import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api-service';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';
import { CardRow } from './card-row';
import { buildRejected } from './default-cards/rejected';
import { buildGreylisted } from './default-cards/greylisted';
import { buildSpam } from './default-cards/spam';
import { buildDelivered } from './default-cards/delivered';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {
  private readonly _cards: Array<CardRow>;
  public get cards (): Array<CardRow> {
    return this._cards;
  }

  constructor (private _apiService: ApiService,
               private _dashboardSettingsService: DashboardSettingsService) {
    this._cards = [];
  }

  ngOnInit () {
    if (this._cards.length === 0) {
      this.buildDefaultCards();
    }
  }

  private buildDefaultCards (): void {
    this._cards.push(buildRejected(this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildGreylisted(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildSpam(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildDelivered(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));
  }
}
