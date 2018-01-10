import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api-service';
import { AdvancedCountEndpoint } from '../api/request/endpoints/advanced-count-endpoint';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { isNullOrUndefined } from 'util';
import { SettingsService } from '../settings-service/settings.service';
import { DashboardCardData } from './dashboard-card/dashboard-card-data';

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
  get requestBuilderMatrix (): Array<CardRow> {
    return this._requestBuilderMatrix;
  }

  private _pastHoursCount: number;

  constructor (private apiService: ApiService,
               private settings: SettingsService) {
    this._pastHoursCount = 480;
  }

  ngOnInit () {
    this.buildRequestBuilderMatrix();
  }

  private buildRequestBuilderMatrix (): void {
    this._requestBuilderMatrix = [];

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
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this.settings.dashboard.maxItemCountPerCard));
        } else {
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this.settings.dashboard.maxItemCountPerCard, '@'));
        }

        const date = new Date();
        date.setHours(date.getHours() - this._pastHoursCount);
        builder.setStartDatetime(date);

        this._requestBuilderMatrix[ i ].cardData[ j ] = new DashboardCardData(builder);
      }
    }

    let addFilterToBuilder: (RequestBuilder) => void;

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

    /*
     * Top reject reasons
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('rejectreason', '', new Comparator(ComparatorType.Regex));
    };

    addFilterToBuilder(this._requestBuilderMatrix[ 3 ].cardData[ 0 ]);

    this._requestBuilderMatrix[ 3 ].title = this.rejectTitle;
    this._requestBuilderMatrix[ 3 ].cardData[ 0 ].title = this.rejectReasons;

    // there is not a card for domain names only
    this._requestBuilderMatrix[ 3 ].cardData.splice(1, 1);
  }
}

