import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';
import { CardRow } from './card-row';
import { buildRejected } from './default-cards/rejected';
import { buildGreylisted } from './default-cards/greylisted';
import { buildSpam } from './default-cards/spam';
import { buildDelivered } from './default-cards/delivered';
import { DashboardAddCardModalComponent } from './dashboard-add-card-modal/dashboard-add-card-modal.component';
import { MatDialog } from '@angular/material';
import { isNullOrUndefined } from 'util';
import { DashboardArrangementModalComponent } from './dashboard-arrangement-modal/dashboard-arrangement-modal.component';
import { QuestionModalComponent } from '../question-modal/question-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {
  private _cards: Array<CardRow>;
  public get cards (): Array<CardRow> {
    return this._cards;
  }

  public constructor (private _apiService: ApiService,
                      private _dashboardSettingsService: DashboardSettingsService,
                      private _dialog: MatDialog) {
    this._cards = [];
  }

  public ngOnInit () {
    if (this._dashboardSettingsService.isInitialized) {
      this.onSettingsInitialized();
    } else {
      this._dashboardSettingsService
        .onFinishInitialize
        .subscribe(() => this.onSettingsInitialized());
    }
  }

  private onSettingsInitialized (): void {
    const cards = this._dashboardSettingsService.getCards();
    if (!Array.isEmptyNullOrUndefined(cards)) {
      this._cards = cards;
    } else {
      if (this._cards.length === 0) {
        this.buildDefaultCards();
      }
    }
  }

  private buildDefaultCards (): void {
    this._cards.push(buildRejected(this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildGreylisted(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildSpam(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));
    this._cards.push(buildDelivered(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService));

    this.saveCards();
  }

  private saveCards (): void {
    this._dashboardSettingsService.setCards(this._cards);
  }

  public addCard (): void {
    const dialogRef = this._dialog.open(DashboardAddCardModalComponent);
    dialogRef
      .afterClosed()
      .subscribe((result: CardRow) => {
        if (isNullOrUndefined(result) || isNullOrUndefined(result.cardData)) {
          return;
        }

        const hasTitle = !String.isEmptyNullOrUndefined(result.title);
        const hasChildren = result.cardData.length > 0;
        let childrenAreValid = true;

        result.cardData.forEach(card => {
          const childHasTitle = !String.isEmptyNullOrUndefined(card.title);
          if (!childHasTitle) {
            childrenAreValid = false;
          }
        });

        if (!hasTitle || !hasChildren || !childrenAreValid) {
          return;
        }

        this._cards.push(result as CardRow);
        this.saveCards();
      });
  }

  public rearrangeCards (): void {
    const dialogRef = this._dialog.open(DashboardArrangementModalComponent, {
      data: this._cards
    });
  }

  public restoreDefaultCards (): void {
    this._dialog.open(QuestionModalComponent, {
      data: {
        title: 'Restore?',
        text: 'Do you want to restore the default cards?',
        actions: [
          {
            label: 'Yes',
            callback: () => {
              this._cards = [];
              this.buildDefaultCards();
            }
          },
          {
            label: 'No',
            callback: () => {
            }
          }
        ]
      }
    });
  }

  public deleteCard (card: CardRow): void {
    const index = this._cards.findIndex(value => value === card);
    if (index >= 0) {
      this._cards.splice(index, 1);
    }

    this.saveCards();
  }

  public editCard (card: CardRow): void {
    console.log('Missing implementation.');
  }
}
