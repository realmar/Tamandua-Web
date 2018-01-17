import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api-service';
import { AdvancedCountEndpoint } from '../api/request/endpoints/advanced-count-endpoint';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { isNullOrUndefined } from 'util';
import { DashboardCardData } from './dashboard-card/dashboard-card-data';
import { DashboardStateService } from '../state/dashboard-state-service/dashboard-state.service';
import { DashboardOverviewCardComponent } from './dashboard-overview-card/dashboard-overview-card.component';

interface CardRow {
  title: string;
  readonly cardData: Array<DashboardCardData>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {

  @ViewChild(DashboardOverviewCardComponent) private _overviewCard: DashboardOverviewCardComponent;

  // region Card Text Constants

  private readonly deliveredTitle = 'Delivered';

  private readonly deliveredSenders = 'Top delivered senders';
  private readonly deliveredSenderDomains = 'Top delivered sender domains';

  private readonly greylisted = 'Greylisted';

  private readonly greylistedTitle = 'Top greylisted';
  private readonly greylistedDomains = 'Top greylisted domains';

  private readonly spamTitle = 'Spam';

  private readonly spamSenders = 'Top spam senders';
  private readonly spamSenderDomains = 'Top spam sender domains';

  private readonly rejectTitle = 'Rejected';
  private readonly rejectReasons = 'Top reject reasons';

  // endregion

  private _requestBuilderMatrix: Array<CardRow>;
  public get requestBuilderMatrix (): Array<CardRow> {
    return this._requestBuilderMatrix;
  }

  public get pastHoursCount (): number {
    return this.dashboardStateService.pastHours;
  }

  public set pastHoursCount (value: number) {
    this.dashboardStateService.pastHours = value;
  }

  public get maxItemCountPerCard (): number {
    return this.dashboardStateService.maxItemCountPerCard;
  }

  public set maxItemCountPerCard (value: number) {
    this.dashboardStateService.maxItemCountPerCard = value;
  }

  public get refreshInterval (): number {
    return this.dashboardStateService.refreshInterval / 1000;
  }

  public set refreshInterval (value: number) {
    this.dashboardStateService.refreshInterval = value * 1000;
  }

  constructor (private apiService: ApiService,
               private dashboardStateService: DashboardStateService) {
    this._requestBuilderMatrix = [];
  }

  ngOnInit () {
    this.buildRequestBuilderMatrix();
  }

  private buildRequestBuilderMatrix (): void {
    /*
     * Create default request builders
     */

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        if (isNullOrUndefined(this._requestBuilderMatrix[ i ])) {
          this._requestBuilderMatrix[ i ] = {
            title: '',
            cardData: []
          };
        }

        const builder = this.apiService.getRequestBuilder();

        if (j % 2 === 0) {
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this.dashboardStateService.maxItemCountPerCard));
        } else {
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this.dashboardStateService.maxItemCountPerCard, '@'));
        }

        const date = new Date();
        date.setHours(date.getHours() - this.pastHoursCount);
        builder.setStartDatetime(date);

        this._requestBuilderMatrix[ i ].cardData[ j ] = new DashboardCardData(builder);
      }
    }

    let addFilterToBuilder: (RequestBuilder) => void;

    const defaultOnItemClickFieldBuilder = (value: string | number) => {
      return {
        name: 'sender',
        value: value,
        comparator: new Comparator(ComparatorType.Equals)
      };
    };

    const defaultOnItemClickFieldBuilderDomainOnly = (value: string | number) => {
      return {
        name: 'sender',
        value: value + '$',
        comparator: new Comparator(ComparatorType.Regex)
      };
    };

    /*
     * Top delivered senders
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('deliverystatus', 'sent', new Comparator(ComparatorType.Equals));
    };

    addFilterToBuilder(this._requestBuilderMatrix[ 0 ].cardData[ 0 ]);
    addFilterToBuilder(this._requestBuilderMatrix[ 0 ].cardData[ 1 ]);

    this._requestBuilderMatrix[ 0 ].title = this.deliveredTitle;

    this._requestBuilderMatrix[ 0 ].cardData[ 0 ].title = this.deliveredSenders;
    this._requestBuilderMatrix[ 0 ].cardData[ 1 ].title = this.deliveredSenderDomains;

    this._requestBuilderMatrix[ 0 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._requestBuilderMatrix[ 0 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top greylisted
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));
    };

    addFilterToBuilder(this._requestBuilderMatrix[ 1 ].cardData[ 0 ]);
    addFilterToBuilder(this._requestBuilderMatrix[ 1 ].cardData[ 1 ]);

    this._requestBuilderMatrix[ 1 ].title = this.greylistedTitle;

    this._requestBuilderMatrix[ 1 ].cardData[ 0 ].title = this.greylisted;
    this._requestBuilderMatrix[ 1 ].cardData[ 1 ].title = this.greylistedDomains;

    this._requestBuilderMatrix[ 1 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._requestBuilderMatrix[ 1 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top spam sender
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));
    };

    addFilterToBuilder(this._requestBuilderMatrix[ 2 ].cardData[ 0 ]);
    addFilterToBuilder(this._requestBuilderMatrix[ 2 ].cardData[ 1 ]);

    this._requestBuilderMatrix[ 2 ].title = this.spamTitle;

    this._requestBuilderMatrix[ 2 ].cardData[ 0 ].title = this.spamSenders;
    this._requestBuilderMatrix[ 2 ].cardData[ 1 ].title = this.spamSenderDomains;

    this._requestBuilderMatrix[ 2 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._requestBuilderMatrix[ 2 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top reject reasons
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.setEndpoint(new AdvancedCountEndpoint('rejectreason', this.dashboardStateService.maxItemCountPerCard));
    };

    addFilterToBuilder(this._requestBuilderMatrix[ 3 ].cardData[ 0 ]);

    this._requestBuilderMatrix[ 3 ].title = this.rejectTitle;
    this._requestBuilderMatrix[ 3 ].cardData[ 0 ].title = this.rejectReasons;

    // there is not a card for domain names only
    this._requestBuilderMatrix[ 3 ].cardData.splice(1, 1);
    this._requestBuilderMatrix[ 3 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
  }

  public onRefreshClick (): void {
    this.buildRequestBuilderMatrix();
    this._overviewCard.onHoursChanged();
  }
}

