import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './routing/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatAutocompleteModule,
  MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule, MatListModule, MatMenuModule,
  MatNativeDateModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
  MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchComponent } from './search/search.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { ApiService } from './api/api-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchDatetimeComponent } from './search-datetime/search-datetime.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchResultDetailsModalComponent } from './search-results/search-result-details-modal/search-result-details-modal.component';
import { SearchResultAddColumnsModalComponent } from './search-results/search-result-add-columns/search-result-add-columns-modal.component';
import { SearchResultTagsSelectionComponent } from './search-results/search-result-tags-selection/search-result-tags-selection.component';
import { SearchStateService } from './state/search-state-service/search-state.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardCardComponent } from './dashboard/dashboard-card/dashboard-card.component';
import { DashboardCardItemComponent } from './dashboard/dashboard-card-item/dashboard-card-item.component';
import { CachedTamanduaService } from './api/cached-tamandua.service';
import { DashboardStateService } from './state/dashboard-state-service/dashboard-state.service';
import { DashboardOverviewCardComponent } from './dashboard/dashboard-overview-card/dashboard-overview-card.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SaveObjectComponent } from './save-object/save-object.component';
import { TamanduaMockService } from './api/tamandua-mock.service';
import { CustomReuseStrategy } from './routing/custom-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { PersistentStorageService } from './persistence/persistent-storage-service';
import { IndexedDbService } from './persistence/indexed-db.service';
import { DashboardPersistentStateServiceService } from './state/dashboard-state-service/dashboard-persistent-state-service.service';
import { SearchPersistentStateService } from './state/search-state-service/search-persistent-state.service';
import { LocalstorageService } from './persistence/localstorage.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NavigationComponent,
    SearchComponent,
    SearchFieldComponent,
    SearchDatetimeComponent,
    SearchResultsComponent,
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent,
    SearchResultTagsSelectionComponent,
    DashboardCardComponent,
    DashboardCardItemComponent,
    DashboardOverviewCardComponent,
    SafeHtmlPipe,
    SaveObjectComponent
  ],
  imports: [
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
    MatSelectModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatMenuModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: ApiService, useClass: CachedTamanduaService },
    { provide: PersistentStorageService, useClass: LocalstorageService },
    { provide: SearchStateService, useClass: SearchPersistentStateService },
    { provide: DashboardStateService, useClass: DashboardPersistentStateServiceService },
    HttpClientModule
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent
  ]
})
export class AppModule {
}
