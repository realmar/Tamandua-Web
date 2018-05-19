import { HighlightedWords } from './search-result-details-modal/highlighted-words';
import { SearchRow } from '../../../api/response/search-reponse';

export interface TableSearchRow {
  highlightedWords: HighlightedWords;
  readonly row: SearchRow;
}
