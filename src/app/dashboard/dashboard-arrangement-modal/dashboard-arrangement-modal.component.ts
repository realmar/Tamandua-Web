import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DashboardCardModalComponent } from '../dashboard-add-card-modal/dashboard-card-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CardRow } from '../card-row';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';

@Component({
  selector: 'app-dashboard-arrangement-modal',
  templateUrl: './dashboard-arrangement-modal.component.html',
  styleUrls: [ './dashboard-arrangement-modal.component.scss' ]
})
export class DashboardArrangementModalComponent implements OnInit {
  public constructor (private _dashboardSettings: DashboardSettingsService,
                      private _dialogRef: MatDialogRef<DashboardArrangementModalComponent>,
                      @Inject(MAT_DIALOG_DATA) public cards: Array<CardRow>) {
  }

  public ngOnInit () {
  }

  public onDropped (event: any): void {
    this._dashboardSettings.setCards(this.cards);
  }
}
