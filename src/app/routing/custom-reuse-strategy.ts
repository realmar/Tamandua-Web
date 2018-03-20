import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { routes } from './app-routing.module';

export class CustomReuseStrategy implements RouteReuseStrategy {
  private readonly _storedRoutes: Map<string, DetachedRouteHandle>;

  public constructor () {
    this._storedRoutes = new Map<string, DetachedRouteHandle>();
  }

  public shouldDetach (route: ActivatedRouteSnapshot): boolean {
    return routes.some(x => x.path === route.routeConfig.path && x.isCached);
  }

  public store (route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (handle == null) {
      return;
    }

    this._storedRoutes.set(route.routeConfig.path, handle);
  }

  public shouldAttach (route: ActivatedRouteSnapshot): boolean {
    return this._storedRoutes.has(route.routeConfig.path);
  }

  public retrieve (route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this._storedRoutes.get(route.routeConfig.path);
  }

  public shouldReuseRoute (future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
