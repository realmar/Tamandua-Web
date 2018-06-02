import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';
import { CardRow } from './card-row';
import { buildRejected } from './default-cards/rejected';
import { buildGreylisted } from './default-cards/greylisted';
import { buildSpam } from './default-cards/spam';
import { buildDelivered } from './default-cards/delivered';
import { DashboardCardModalComponent } from './dashboard-add-card-modal/dashboard-card-modal.component';
import { MatDialog } from '@angular/material';
import { isNullOrUndefined } from '../../utils/misc';
import { Subscription, Subject, Observable } from 'rxjs';
import { createAdvancedEndpoint } from '../../api/request/endpoints/advanced-count-endpoint';
import { unsubscribeIfDefined } from '../../utils/rxjs';
import { createNoAction, createYesAction } from '../../question-modal/question-modal-utils';
import { QuestionModalComponent } from '../../question-modal/question-modal.component';
import { DragulaService } from 'ng2-dragula';
import { defaultDragulaOptions } from '../../utils/dragula';
import { CardRowWrapper } from './card-row-wrapper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _onCardDropSubscription: Subscription;

  public get bagName (): string {
    return 'dashboard-card-bag';
  }

  public get dragulaOptions (): any {
    return defaultDragulaOptions;
  }

  private _cards: Array<CardRowWrapper>;
  public get cards (): Array<CardRowWrapper> {
    return this._cards;
  }

  private _resetOverviewCardSubject: Subject<any>;
  private _editOverciewCardSubject: Subject<any>;

  private _maxItemCountChangeSubscription: Subscription;

  public get resetOverviewCardObservable (): Observable<any> {
    return this._resetOverviewCardSubject.asObservable();
  }

  public get editOverciewCardObservable (): Observable<any> {
    return this._editOverciewCardSubject.asObservable();
  }

  public constructor (private _apiService: ApiService,
                      private _dashboardSettingsService: DashboardSettingsService,
                      private _dialog: MatDialog,
                      private _dragulaService: DragulaService) {
    this._cards = [];
    this._resetOverviewCardSubject = new Subject<any>();
    this._editOverciewCardSubject = new Subject<any>();
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

  public ngOnDestroy (): void {
    unsubscribeIfDefined(this._maxItemCountChangeSubscription, this._onCardDropSubscription);
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

    this._maxItemCountChangeSubscription =
      this._dashboardSettingsService.maxItemCountObservable.subscribe(this.onMaxItemCountChange.bind(this));
    this._onCardDropSubscription =
      this._dragulaService.drop.subscribe(() => this.onCardDrop());
  }

  private buildCardWrapper (isSummaryCard: boolean, cardRow?: CardRow) {
    return {
      isSummaryCard: isSummaryCard,
      cardRow: cardRow
    };
  }

  private buildDefaultCards (): void {
    this._cards.push(this.buildCardWrapper(true));
    this._cards.push(this.buildCardWrapper(false, buildRejected(this._apiService.getRequestBuilder(), this._dashboardSettingsService)));
    this._cards.push(this.buildCardWrapper(false, buildGreylisted(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService)));
    this._cards.push(this.buildCardWrapper(false, buildSpam(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService)));
    this._cards.push(this.buildCardWrapper(false, buildDelivered(() => this._apiService.getRequestBuilder(), this._dashboardSettingsService)));

    this.saveCards();
  }

  private saveCards (): void {
    this._dashboardSettingsService.setCards(this._cards);
  }

  private getIndexOfCard (card: CardRowWrapper): number {
    return this._cards.findIndex(value => value.cardRow === card.cardRow);
  }

  private onMaxItemCountChange (value: number): void {
    this._cards.forEach(card => {
      if (isNullOrUndefined(card.cardRow)) {
        return;
      }

      card.cardRow.cardData.forEach(data => {
        const endpoint = data.requestBuilder.getEndpoint();

        const field = endpoint.metadata.field;
        const length = value;
        const separator = endpoint.metadata.separator;

        data.requestBuilder.setEndpoint(createAdvancedEndpoint(field, length, separator));
      });
    });

    this.saveCards();
  }

  private onCardDrop (): void {
    this.saveCards();
  }

  public addOrModifyCard (existingCard?: CardRowWrapper): void {
    const config = {
      minWidth: '30%',
      minHeight: '60%',
    };

    if (!isNullOrUndefined(existingCard)) {
      config[ 'data' ] = existingCard.cardRow;
    }

    const dialogRef = this._dialog.open(DashboardCardModalComponent, config);
    if (!isNullOrUndefined(existingCard)) {
      dialogRef.componentInstance.applyButtonLabel = 'Edit';
    }

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

        let pushCard = true;
        if (!isNullOrUndefined(existingCard)) {
          const index = this.getIndexOfCard(existingCard);
          if (index >= 0) {
            pushCard = false;
            this._cards[ index ].cardRow = result;
          }
        }

        if (pushCard) {
          this._cards.push(this.buildCardWrapper(false, result));
        }

        this.saveCards();
      });
  }

  public restoreDefaultCards (): void {
    this._dialog.open(QuestionModalComponent, {
      data: {
        title: 'Restore?',
        text: 'Do you want to restore the default cards?',
        actions: [
          createYesAction(() => {
            this._cards = [];
            this.buildDefaultCards();
          }),
          createNoAction()
        ]
      }
    });
  }

  public deleteCard (card: CardRowWrapper): void {
    this._dialog.open(QuestionModalComponent, {
      data: {
        title: 'Delete?',
        text: `Do you really want to delete the card: ${card.cardRow.title}?`,
        actions: [
          createYesAction(() => {
            const index = this.getIndexOfCard(card);
            if (index >= 0) {
              this._cards.splice(index, 1);
            }

            this.saveCards();
          }),
          createNoAction()
        ]
      }
    });
  }

  public editCard (card: CardRowWrapper): void {
    this.addOrModifyCard(card);
  }

  public resetSummaryCard (): void {
    this._dialog.open(QuestionModalComponent, {
      data: {
        title: 'Reset?',
        text: 'Do you really want to reset the summary card to the default values?',
        actions: [
          createYesAction(() => this._resetOverviewCardSubject.next()),
          createNoAction()
        ]
      }
    });
  }

  public editSummaryCard (): void {
    this._editOverciewCardSubject.next();
  }
}
