import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CardRow } from '../card-row';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { unsubscribeIfDefined } from '../../../utils/rxjs';

@Component({
  selector: 'app-dashboard-arrangement-modal',
  templateUrl: './dashboard-arrangement-modal.component.html',
  styleUrls: [ './dashboard-arrangement-modal.component.scss' ]
})
export class DashboardArrangementModalComponent implements OnInit, OnDestroy {
  private _onDropSubscription: Subscription;

  public constructor (private _dashboardSettings: DashboardSettingsService,
                      private _dialogRef: MatDialogRef<DashboardArrangementModalComponent>,
                      @Inject(MAT_DIALOG_DATA) public cards: Array<CardRow>,
                      private _dragulaService: DragulaService) {
  }

  public ngOnInit () {
    this._onDropSubscription = this._dragulaService.drop.subscribe(() => this.onDropped());
  }

  public ngOnDestroy (): void {
    unsubscribeIfDefined(this._onDropSubscription);
  }

  public onDropped (): void {
    this._dashboardSettings.setCards(this.cards);
  }
}
