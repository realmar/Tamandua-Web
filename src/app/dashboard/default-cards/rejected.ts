import { CardRowBuilder } from '../card-row-builder';
import { RequestBuilder } from '../../../api/request/request-builder';
import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { pastDate } from './helpers';
import { CardRow } from '../card-row';
import { createAdvancedEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';

export function buildRejected (requestBuilder: RequestBuilder, dashboardSettings: DashboardSettingsService): CardRow {
  const builder = new CardRowBuilder();

  requestBuilder.setStartDatetime(pastDate(dashboardSettings.getPastHours()));
  requestBuilder.setEndpoint(
    createAdvancedEndpoint('rejectreason', dashboardSettings.getMaxItemCountPerCard()));

  const baseFields = {
    name: 'rejectreason',
    value: '^{value}',
    comparator: new Comparator(ComparatorType.Regex)
  };

  builder.setTitle('Rejected');
  builder.addChild('Top reject reasons', [ baseFields ], requestBuilder);

  return builder.build();
}
