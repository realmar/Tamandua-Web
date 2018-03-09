import { DashboardCardData } from './dashboard-card/dashboard-card-data';

export interface CardRow {
  title: string;
  readonly cardData: Array<DashboardCardData>;
}
