import { OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/index';
import { unsubscribeIfDefined } from '../utils/rxjs';
import * as moment from 'moment';
import { Moment } from 'moment';
import { isNullOrUndefined } from '../utils/misc';

export abstract class RouteChangeListener implements OnInit, OnDestroy {
  private _routerEventSubscription: Subscription;
  private _routeMatcher: RegExp;
  private _isCurrentRoute: boolean;
  private _routeExitTime: Moment;
  protected get routeExitTime (): Moment {
    if (isNullOrUndefined(this._routeExitTime)) {
      return moment();
    } else {
      return this._routeExitTime;
    }
  }

  protected constructor (protected readonly router: Router) {
    this._isCurrentRoute = false;
  }

  public ngOnInit (): void {
    this._routerEventSubscription = this.router.events.subscribe(this.onRouterEvents.bind(this));
    this._routeMatcher = this.getRouteMatcher();
    this._isCurrentRoute = true;
  }

  public ngOnDestroy (): void {
    unsubscribeIfDefined(this._routerEventSubscription);
  }

  protected abstract getRouteMatcher (): RegExp;

  protected abstract onRouteReenter (): void;

  protected onRouteExit (): void {
    this._routeExitTime = moment();
  }

  private onRouterEvents (event: Event): void {
    if (!(event instanceof NavigationEnd)) {
      return;
    }

    if (this._routeMatcher.test(this.router.url)) {
      this._isCurrentRoute = true;
      this.onRouteReenter();
    } else if (this._isCurrentRoute) {
      this._isCurrentRoute = false;
      this.onRouteExit();
    }
  }
}
