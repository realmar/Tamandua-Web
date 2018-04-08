import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { RequestBuilder } from '../../../api/request/request-builder';
import { CardRowBuilder } from '../card-row-builder';
import { configureGenericCardChildren } from './helpers';
import { CardRow } from '../card-row';

export function buildSpam (createRequestBuilder: () => RequestBuilder, dashboardSettings: DashboardSettingsService): CardRow {
  const cardBuilder = new CardRowBuilder();
  cardBuilder.setTitle('Spam');

  const configureCustomFilter = (requestBuilder: RequestBuilder) => {
    requestBuilder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));
  };

  configureGenericCardChildren({
    createRequestBuilder: createRequestBuilder,
    cardBuilder: cardBuilder,
    configureCustomFilter: configureCustomFilter,
    pastHours: dashboardSettings.getPastHours(),
    itemCount: dashboardSettings.getMaxItemCountPerCard(),
    fullEmailChildTitle: 'Top spam senders',
    domainChildTitle: 'Top spam sender domains'
  });

  return cardBuilder.build();
}
