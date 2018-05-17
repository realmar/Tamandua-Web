import { OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/index';
import { unsubscribeIfDefined } from '../utils/rxjs';

export abstract class RouteReenterListener implements OnInit, OnDestroy {
  private _routerEventSubscription: Subscription;
  private _routeMatcher: RegExp;

  protected constructor (private _router: Router) {
  }

  public ngOnInit (): void {
    this._routerEventSubscription = this._router.events.subscribe(this.onRouterEvents.bind(this));
    this._routeMatcher = this.getRouteMatcher();
  }

  public ngOnDestroy (): void {
    unsubscribeIfDefined(this._routerEventSubscription);
  }

  protected abstract getRouteMatcher (): RegExp;

  protected abstract onRouteReenter (): void;

  private onRouterEvents (event: Event): void {
    if (!(event instanceof NavigationEnd)) {
      return;
    }

    if (this._routeMatcher.test(this._router.url)) {
      this.onRouteReenter();
    }
  }
}
