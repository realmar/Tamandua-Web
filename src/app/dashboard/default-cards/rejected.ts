import { CardRowBuilder } from '../card-row-builder';
import { RequestBuilder } from '../../../api/request/request-builder';
import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { AdvancedCountEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';
import { pastDate } from './helpers';
import { CardRow } from '../card-row';

export function buildRejected (requestBuilder: RequestBuilder, dashboardSettings: DashboardSettingsService): CardRow {
  const builder = new CardRowBuilder();

  requestBuilder.setStartDatetime(pastDate(dashboardSettings.getPastHours()));
  requestBuilder.setEndpoint(
    new AdvancedCountEndpoint('rejectreason', dashboardSettings.getMaxItemCountPerCard()));

  const itemClickFieldBuilder = value => {
    return {
      name: 'rejectreason',
      value: '^' + value,
      comparator: new Comparator(ComparatorType.Regex)
    };
  };

  builder.setTitle('Rejected');
  builder.addChild('Top reject reasons', itemClickFieldBuilder, requestBuilder);

  return builder.build();
}
