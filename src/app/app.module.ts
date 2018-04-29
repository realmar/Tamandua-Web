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
  MatDialogModule, MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatMenuModule,
  MatNativeDateModule, MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule, MatSelectModule, MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchComponent } from './search/search.component';
import { ApiService } from '../api/api-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchResultDetailsModalComponent } from './search-results/search-result-details-modal/search-result-details-modal.component';
import { SearchResultAddColumnsModalComponent } from './search-results/search-result-add-columns/search-result-add-columns-modal.component';
import { SearchResultTagsSelectionComponent } from './search-results/search-result-tags-selection/search-result-tags-selection.component';
import { SearchSettingsService } from './settings/search-settings-service/search-settings.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardCardComponent } from './dashboard/dashboard-card/dashboard-card.component';
import { DashboardCardItemComponent } from './dashboard/dashboard-card-item/dashboard-card-item.component';
import { DashboardSettingsService } from './settings/dashboard-settings-service/dashboard-settings.service';
import { DashboardOverviewCardComponent } from './dashboard/dashboard-overview-card/dashboard-overview-card.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SaveObjectComponent } from './save-object/save-object.component';
import { CustomReuseStrategy } from './routing/custom-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { PersistentStorageService } from '../persistence/persistent-storage-service';
import { DashboardPersistentSettingsService } from './settings/dashboard-settings-service/dashboard-persistent-settings.service';
import { SearchPersistentSettingsService } from './settings/search-settings-service/search-persistent-settings.service';
import { PersistentCachedTamanduaService } from '../api/persistent-cached-tamandua.service';
import { IndexedDbService } from '../persistence/indexed-db.service';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { SearchStateService } from './search-state-service/search-state.service';
import { ScrollbarModule } from 'ngx-scrollbar';
import { DashboardSettingComponent } from './dashboard/dashboard-settings/dashboard-setting/dashboard-setting.component';
import { DashboardSettingsComponent } from './dashboard/dashboard-settings/dashboard-settings.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component';
import { ToastrModule } from 'ngx-toastr';
import { FormatLoglinePipe } from './search-results/search-result-details-modal/format-logline.pipe';
import { NotFoundComponent } from './not-found/not-found.component';
import { CachedApiService } from '../api/cached-api-service';
import { SearchMaskModule } from '../search-mask/search-mask.module';
import { DashboardAddCardModalComponent } from './dashboard/dashboard-add-card-modal/dashboard-add-card-modal.component';
import { DashboardArrangementModalComponent } from './dashboard/dashboard-arrangement-modal/dashboard-arrangement-modal.component';
import { QuestionModalComponent } from './question-modal/question-modal.component';

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
    SaveObjectComponent,
    DashboardSettingComponent,
    DashboardSettingsComponent,
    AboutComponent,
    FooterComponent,
    FormatLoglinePipe,
    NotFoundComponent,
    DashboardAddCardModalComponent,
    DashboardArrangementModalComponent,
    QuestionModalComponent
  ],
  imports: [
    SearchMaskModule,

    BrowserModule,
    AppRoutingModule,
    HttpClientModule,

    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

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

    NgxDnDModule,
    ScrollbarModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: ApiService, useClass: PersistentCachedTamanduaService },
    { provide: CachedApiService, useExisting: ApiService },
    { provide: PersistentStorageService, useClass: IndexedDbService },
    { provide: SearchSettingsService, useClass: SearchPersistentSettingsService },
    { provide: DashboardSettingsService, useClass: DashboardPersistentSettingsService },
    SearchStateService,
    HttpClientModule
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent,
    DashboardAddCardModalComponent,
    DashboardArrangementModalComponent,
    QuestionModalComponent
  ]
})
export class AppModule {
}
