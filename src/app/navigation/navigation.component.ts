import { Component } from '@angular/core';
import { TrendStateService } from '../trend/trend-state-service/trend-state.service';
import { isNullOrUndefined } from '../../utils/misc';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: [ './navigation.component.scss' ]
})
export class NavigationComponent {
  public get hasTrendData (): boolean {
    return !isNullOrUndefined(this._trendStateService.data);
  }

  public constructor (private _trendStateService: TrendStateService) {
  }
}
