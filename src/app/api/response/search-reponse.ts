export interface SearchRow {
  [index: string]: string | number | Array<string | number>;
}

export interface SearchResponse {
  total_rows: number;
  rows: Array<SearchRow>;
}
