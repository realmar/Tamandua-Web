import { SearchMaskResult } from './search-mask-result';

export interface SearchMaskButton {
  readonly label: string;
  readonly callback: (result: SearchMaskResult) => void;
}
