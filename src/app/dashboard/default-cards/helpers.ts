import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { RequestBuilder } from '../../../api/request/request-builder';
import { CardRowBuilder } from '../card-row-builder';
import { createAdvancedEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';

/**
 * Returns date {hours} in the past from now. (now - hours)
 * @param {number} hours in the past
 * @returns {Date} past date
 */
export function pastDate (hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);

  return date;
}

export function configureGenericRequestData (requestBuilder: RequestBuilder,
                                             pastHours: number,
                                             itemCount: number,
                                             separator?: string): void {
  requestBuilder.setStartDatetime(pastDate(pastHours));
  requestBuilder.setEndpoint(createAdvancedEndpoint('sender', itemCount, separator));
}

export interface ConfigureGenericCardChildrenArgs {
  createRequestBuilder: () => RequestBuilder;
  cardBuilder: CardRowBuilder;
  configureCustomFilter: (requestBuilder: RequestBuilder) => void;
  pastHours: number;
  itemCount: number;
  fullEmailChildTitle: string;
  domainChildTitle: string;
}

export function configureGenericCardChildren (args: ConfigureGenericCardChildrenArgs): void {
  {
    const requestBuilder = args.createRequestBuilder();
    configureGenericRequestData(requestBuilder, args.pastHours, args.itemCount);
    args.configureCustomFilter(requestBuilder);

    const baseFields = {
      name: 'sender',
      value: '{value}',
      comparator: new Comparator(ComparatorType.Equals)
    };
    args.cardBuilder.addChild(args.fullEmailChildTitle, [ baseFields ], requestBuilder);
  }

  {
    const requestBuilder = args.createRequestBuilder();
    configureGenericRequestData(requestBuilder, args.pastHours, args.itemCount, '@');
    args.configureCustomFilter(requestBuilder);

    const baseFields = {
      name: 'sender',
      value: '{value}$',
      comparator: new Comparator(ComparatorType.Regex)
    };
    args.cardBuilder.addChild(args.domainChildTitle, [ baseFields ], requestBuilder);
  }
}
