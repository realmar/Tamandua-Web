import { SearchRow } from '../../api/response/search-reponse';
import { HighlightedWords } from './search-result-details-modal/highlighted-words';

export interface TableSearchRow {
  highlightedWords: HighlightedWords;
  readonly row: SearchRow;
}
