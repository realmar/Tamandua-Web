import { Comparator, ComparatorType } from '../../api/request/comparator';
import { RequestBuilder } from '../../api/request/request-builder';
import { AdvancedCountEndpoint } from '../../api/request/endpoints/advanced-count-endpoint';
import { CardRowBuilder } from '../card-row-builder';

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

export function defaultOnItemClickFieldBuilder (value: string | number) {
  return {
    name: 'sender',
    value: value,
    comparator: new Comparator(ComparatorType.Equals)
  };
}

export function defaultOnItemClickFieldBuilderDomainOnly (value: string | number) {
  return {
    name: 'sender',
    value: value + '$',
    comparator: new Comparator(ComparatorType.Regex)
  };
}

export function configureGenericRequestData (requestBuilder: RequestBuilder,
                                             pastHours: number,
                                             itemCount: number,
                                             separator?: string): void {
  requestBuilder.setStartDatetime(pastDate(pastHours));
  requestBuilder.setEndpoint(
    new AdvancedCountEndpoint('sender', itemCount, separator));
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

    args.cardBuilder.addChild(args.fullEmailChildTitle, defaultOnItemClickFieldBuilder, requestBuilder);
  }

  {
    const requestBuilder = args.createRequestBuilder();
    configureGenericRequestData(requestBuilder, args.pastHours, args.itemCount, '@');
    args.configureCustomFilter(requestBuilder);

    args.cardBuilder.addChild(args.domainChildTitle, defaultOnItemClickFieldBuilderDomainOnly, requestBuilder);
  }
}
