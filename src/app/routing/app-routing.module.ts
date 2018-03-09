import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SearchComponent } from '../search/search.component';

interface CachedRoute extends Route {
  isCached: boolean;
}

type CachedRoutes = CachedRoute[];

export const routes: CachedRoutes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full', isCached: true },
  { path: 'dashboard', component: DashboardComponent, isCached: true },
  { path: 'search', component: SearchComponent, isCached: true },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
