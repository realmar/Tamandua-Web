import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatNativeDateModule, MatPaginatorModule,
  MatSelectModule, MatSortModule, MatTableModule, MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchComponent } from './search/search.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { ApiService } from './api/api-service';
import { TamanduaMockService } from './api/tamandua-mock.service';
import { FormsModule } from '@angular/forms';
import { SearchDatetimeComponent } from './search-datetime/search-datetime.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchResultDetailsModalComponent } from './search-results/search-result-details-modal/search-result-details-modal.component';
import { SearchResultAddColumnsModalComponent } from './search-results/search-result-add-columns/search-result-add-columns-modal.component';
import { SearchResultTagsSelectionComponent } from './search-results/search-result-tags-selection/search-result-tags-selection.component';

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
    SearchResultTagsSelectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    FormsModule,
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
    MatButtonToggleModule
  ],
  providers: [
    { provide: ApiService, useClass: TamanduaMockService }
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [
    SearchResultDetailsModalComponent,
    SearchResultAddColumnsModalComponent
  ]
})
export class AppModule {
}
