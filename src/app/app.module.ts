import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule,
  MatNativeDateModule,
  MatSelectModule, MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchComponent } from './search/search.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { ApiService } from './tamandua-service/api-service';
import { TamanduaMockService } from './tamandua-service/tamandua-mock.service';
import { FormsModule } from '@angular/forms';
import { SearchDatetimeComponent } from './search-datetime/search-datetime.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NavigationComponent,
    SearchComponent,
    SearchFieldComponent,
    SearchDatetimeComponent
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
    MatToolbarModule
  ],
  providers: [
    { provide: ApiService, useClass: TamanduaMockService }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
