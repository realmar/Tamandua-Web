interface Edge {
  readonly source: string;
  readonly target: string;
}

export interface DirectedGraphResponse {
  readonly nodes: Array<string>;
  readonly edges: Array<Edge>;
}
