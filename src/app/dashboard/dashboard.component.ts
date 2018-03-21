import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api-service';
import { AdvancedCountEndpoint } from '../api/request/endpoints/advanced-count-endpoint';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { isNullOrUndefined } from 'util';
import { DashboardCardData } from './dashboard-card/dashboard-card-data';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';
import { CardRow } from './card-row';
import { SettingValidationResult } from '../settings/setting-validation-result';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {
  // region Card Text Constants

  private readonly _deliveredTitle = 'Delivered';

  private readonly _deliveredSenders = 'Top delivered senders';
  private readonly _deliveredSenderDomains = 'Top delivered sender domains';

  private readonly _greylisted = 'Greylisted';

  private readonly _greylistedTitle = 'Top greylisted';
  private readonly _greylistedDomains = 'Top greylisted domains';

  private readonly _spamTitle = 'Spam';

  private readonly _spamSenders = 'Top spam senders';
  private readonly _spamSenderDomains = 'Top spam sender domains';

  private readonly _rejectTitle = 'Rejected';
  private readonly _rejectReasons = 'Top reject reasons';

  // endregion

  private _cards: Array<CardRow>;
  public get cards (): Array<CardRow> {
    return this._cards;
  }

  constructor (private _apiService: ApiService,
               private _dashboardSettingsService: DashboardSettingsService) {
    this._cards = [];
  }

  ngOnInit () {
    if (this._cards.length === 0) {
      this.buildCards();
    }
  }

  private buildCards (): void {
    /*
     * Create default request builders
     */

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        if (isNullOrUndefined(this._cards[ i ])) {
          this._cards[ i ] = {
            title: '',
            cardData: []
          };
        }

        const builder = this._apiService.getRequestBuilder();

        if (j % 2 === 0) {
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this._dashboardSettingsService.getMaxItemCountPerCard()));
        } else {
          builder.setEndpoint(new AdvancedCountEndpoint('sender', this._dashboardSettingsService.getMaxItemCountPerCard(), '@'));
        }

        const date = new Date();
        date.setHours(date.getHours() - this._dashboardSettingsService.getPastHours());
        builder.setStartDatetime(date);

        this._cards[ i ].cardData[ j ] = new DashboardCardData(builder);
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

    addFilterToBuilder(this._cards[ 0 ].cardData[ 0 ]);
    addFilterToBuilder(this._cards[ 0 ].cardData[ 1 ]);

    this._cards[ 0 ].title = this._deliveredTitle;

    this._cards[ 0 ].cardData[ 0 ].title = this._deliveredSenders;
    this._cards[ 0 ].cardData[ 1 ].title = this._deliveredSenderDomains;

    this._cards[ 0 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._cards[ 0 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top greylisted
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));
    };

    addFilterToBuilder(this._cards[ 1 ].cardData[ 0 ]);
    addFilterToBuilder(this._cards[ 1 ].cardData[ 1 ]);

    this._cards[ 1 ].title = this._greylistedTitle;

    this._cards[ 1 ].cardData[ 0 ].title = this._greylisted;
    this._cards[ 1 ].cardData[ 1 ].title = this._greylistedDomains;

    this._cards[ 1 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._cards[ 1 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top spam sender
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));
    };

    addFilterToBuilder(this._cards[ 2 ].cardData[ 0 ]);
    addFilterToBuilder(this._cards[ 2 ].cardData[ 1 ]);

    this._cards[ 2 ].title = this._spamTitle;

    this._cards[ 2 ].cardData[ 0 ].title = this._spamSenders;
    this._cards[ 2 ].cardData[ 1 ].title = this._spamSenderDomains;

    this._cards[ 2 ].cardData[ 0 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilder;
    this._cards[ 2 ].cardData[ 1 ].onItemClickFieldBuilder = defaultOnItemClickFieldBuilderDomainOnly;

    /*
     * Top reject reasons
     */

    addFilterToBuilder = (data: DashboardCardData) => {
      data.requestBuilder.setEndpoint(new AdvancedCountEndpoint('rejectreason', this._dashboardSettingsService.getMaxItemCountPerCard()));
    };

    addFilterToBuilder(this._cards[ 3 ].cardData[ 0 ]);

    this._cards[ 3 ].title = this._rejectTitle;
    this._cards[ 3 ].cardData[ 0 ].title = this._rejectReasons;

    // there is not a card for domain names only
    this._cards[ 3 ].cardData.splice(1, 1);
    this._cards[ 3 ].cardData[ 0 ].onItemClickFieldBuilder = value => {
      return {
        name: 'rejectreason',
        value: '^' + value,
        comparator: new Comparator(ComparatorType.Regex)
      };
    };
  }
}

