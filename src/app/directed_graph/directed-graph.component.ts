import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { GenericRequest } from '../../api/request/generic-request';
import { createDirectedGraphEndpoint } from '../../api/request/endpoints/directed-graph';
import { DirectedGraphResponse } from '../../api/response/directed-graph-response';
import { ForceDirectedGraphComponent } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-network',
  templateUrl: './directed-graph.component.html',
  styleUrls: [ './directed-graph.component.scss' ]
})
export class DirectedGraphComponent {
  @ViewChild(ForceDirectedGraphComponent) _graph: ForceDirectedGraphComponent;
  public email: string;

  public get canCollectData (): boolean {
    return !String.isEmptyNullOrUndefined(this.email);
  }

  public nodes: Array<any> = [];
  public links: Array<any> = [];

  public constructor (private _apiService: ApiService) {
  }

  private collectData (mail: string): void {
    const request = new GenericRequest({ hours: 96, depth: 4 }, createDirectedGraphEndpoint(mail));
    this._apiService.SubmitRequest<DirectedGraphResponse>(request).subscribe(value => {
      this.nodes = value.nodes.map(x => {
        return {
          value: x
        };
      });
      this.links = value.edges;
      this._graph.update();
    });
  }

  public onSearchButtonClick (): void {
    this.collectData(this.email);
  }
}
