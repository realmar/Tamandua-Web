import { SearchFieldData } from './search-field/search-field-data';

export interface SearchMaskResult {
  readonly startDateTime: Date;
  readonly endDateTime: Date;
  readonly fields: Array<SearchFieldData>;
}
