import { CardRow } from './card-row';

export interface CardRowWrapper {
  readonly isSummaryCard: boolean;
  cardRow?: CardRow;
}
