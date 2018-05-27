import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './routing/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule, MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchComponent } from './search/search.component';
import { ApiService } from '../api/api-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchSettingsService } from './settings/search-settings-service/search-settings.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DashboardCardComponent } from './dashboard/dashboard-card/dashboard-card.component';
import { DashboardCardItemComponent } from './dashboard/dashboard-card-item/dashboard-card-item.component';
import { DashboardSettingsService } from './settings/dashboard-settings-service/dashboard-settings.service';
import { DashboardOverviewCardComponent } from './dashboard/dashboard-overview-card/dashboard-overview-card.component';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { CustomReuseStrategy } from './routing/custom-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { PersistentStorageService } from '../persistence/persistent-storage-service';
import { DashboardPersistentSettingsService } from './settings/dashboard-settings-service/dashboard-persistent-settings.service';
import { SearchPersistentSettingsService } from './settings/search-settings-service/search-persistent-settings.service';
import { IndexedDbService } from '../persistence/indexed-db.service';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { DashboardSettingsComponent } from './dashboard/dashboard-settings/dashboard-settings.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NotFoundComponent } from './not-found/not-found.component';
import { CachedApiService } from '../api/cached-api-service';
import { SearchMaskModule } from '../search-mask/search-mask.module';
import { DashboardCardModalComponent } from './dashboard/dashboard-add-card-modal/dashboard-card-modal.component';
import { DashboardArrangementModalComponent } from './dashboard/dashboard-arrangement-modal/dashboard-arrangement-modal.component';
import { apiFactory } from '../api/di-factory';
import { FlattenPipe } from '../pipes/flatten.pipe';
import { DashboardOverviewEditModalComponent } from './dashboard/dashboard-overview-card/dashboard-overview-edit-modal/dashboard-overview-edit-modal.component';
import { DashboardOverviewEditSearchmaskComponent } from './dashboard/dashboard-overview-card/dashboard-overview-edit-modal/dashboard-overview-edit-searchmask/dashboard-overview-edit-searchmask.component';
import { TreeModule } from 'angular-tree-component';
import { SettingComponent } from './settings/setting-component/setting.component';
import { QuestionModalModule } from '../question-modal/question-modal.module';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { TrendComponent } from './trend/trend.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TrendStateService } from './trend/trend-state-service/trend-state.service';
import { TrendSettingsService } from './settings/trend-settings-service/trend-settings.service';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchResultAddColumnsModalComponent } from './search/search-results/search-result-add-columns/search-result-add-columns-modal.component';
import { SearchResultTagsSelectionComponent } from './search/search-results/search-result-tags-selection/search-result-tags-selection.component';
import { SearchResultDetailsModalComponent } from './search/search-results/search-result-details-modal/search-result-details-modal.component';
import { FormatLoglinePipe } from './search/search-results/search-result-details-modal/format-logline.pipe';
import { SearchStateService } from './search/search-state-service/search-state.service';
import { SortPipe } from '../pipes/sort.pipe';
import { TrendPersistentSettingsService } from './settings/trend-settings-service/trend-persistent-settings.service';
import { SaveObjectModule } from '../save-object/save-object.module';
import { SettingsUtilsService } from './settings/settings-utils-service/settings-utils.service';
import { LoadingAnimationsModule } from '../loading-animations/loading-animations.module';
import { SafeStylePipe } from '../pipes/safe-style.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NavigationComponent,
    SearchComponent,
    SearchResultsComponent,
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent,
    SearchResultTagsSelectionComponent,
    DashboardCardComponent,
    DashboardCardItemComponent,
    DashboardOverviewCardComponent,
    SafeHtmlPipe,
    SafeStylePipe,
    SettingComponent,
    DashboardSettingsComponent,
    AboutComponent,
    FooterComponent,
    FormatLoglinePipe,
    NotFoundComponent,
    DashboardCardModalComponent,
    DashboardArrangementModalComponent,
    FlattenPipe,
    DashboardOverviewEditModalComponent,
    DashboardOverviewEditSearchmaskComponent,
    TrendComponent,
    SortPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    SearchMaskModule,
    QuestionModalModule,
    SaveObjectModule,
    LoadingAnimationsModule,

    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTabsModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,

    TreeModule,
    NgxDnDModule,
    NgxChartsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: ApiService, useFactory: apiFactory, deps: [ ToastrService, PersistentStorageService, HttpClient ] },
    { provide: CachedApiService, useExisting: ApiService },
    { provide: PersistentStorageService, useClass: IndexedDbService },
    { provide: SearchSettingsService, useClass: SearchPersistentSettingsService },
    { provide: DashboardSettingsService, useClass: DashboardPersistentSettingsService },
    { provide: TrendSettingsService, useClass: TrendPersistentSettingsService },
    TrendStateService,
    SearchStateService,
    SettingsUtilsService,
    HttpClientModule
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent,
    DashboardCardModalComponent,
    DashboardArrangementModalComponent,
    DashboardOverviewEditModalComponent,
    DashboardOverviewEditSearchmaskComponent,
    QuestionModalComponent
  ]
})
export class AppModule {
}
