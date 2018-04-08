import { Comparator, ComparatorType } from '../../api/request/comparator';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { CardRowBuilder } from '../card-row-builder';
import { RequestBuilder } from '../../api/request/request-builder';
import { configureGenericCardChildren } from './helpers';
import { CardRow } from '../card-row';

export function buildDelivered (createRequestBuilder: () => RequestBuilder, dashboardSettings: DashboardSettingsService): CardRow {
  const cardBuilder = new CardRowBuilder();
  cardBuilder.setTitle('Delivered');

  const configureCustomFilter = (requestBuilder: RequestBuilder) => {
    requestBuilder.addField('deliverystatus', 'sent', new Comparator(ComparatorType.Equals));
  };

  configureGenericCardChildren({
    createRequestBuilder: createRequestBuilder,
    cardBuilder: cardBuilder,
    configureCustomFilter: configureCustomFilter,
    pastHours: dashboardSettings.getPastHours(),
    itemCount: dashboardSettings.getMaxItemCountPerCard(),
    fullEmailChildTitle: 'Top delivered senders',
    domainChildTitle: 'Top delivered sender domains'
  });

  return cardBuilder.build();
}
