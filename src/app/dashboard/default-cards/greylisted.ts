import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { RequestBuilder } from '../../../api/request/request-builder';
import { configureGenericCardChildren } from './helpers';
import { CardRowBuilder } from '../card-row-builder';
import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { CardRow } from '../card-row';

export function buildGreylisted (createRequestBuilder: () => RequestBuilder, dashboardSettings: DashboardSettingsService): CardRow {
  const cardBuilder = new CardRowBuilder();
  cardBuilder.setTitle('Greylisted');

  const configureCustomFilter = (requestBuilder: RequestBuilder) => {
    requestBuilder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));
  };

  configureGenericCardChildren({
    createRequestBuilder: createRequestBuilder,
    cardBuilder: cardBuilder,
    configureCustomFilter: configureCustomFilter,
    pastHours: dashboardSettings.getPastHours(),
    itemCount: dashboardSettings.getMaxItemCountPerCard(),
    fullEmailChildTitle: 'Top greylisted',
    domainChildTitle: 'Top greylisted domains'
  });

  return cardBuilder.build();
}
