import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchMaskComponent } from './search-mask.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchDatetimeComponent } from './search-datetime/search-datetime.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDatepickerModule,
  MatIconModule, MatInputModule,
  MatListModule, MatProgressSpinnerModule,
  MatSelectModule
} from '@angular/material';
import { ApiService } from '../api/api-service';
import { PersistentCachedTamanduaService } from '../api/persistent-cached-tamandua.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CachedApiService } from '../api/cached-api-service';
import { SearchFieldAutocompleteComponent } from './search-field-autcomplete/search-field-autocomplete.component';

@NgModule({
  declarations: [
    SearchMaskComponent,
    SearchFieldComponent,
    SearchDatetimeComponent,
    SearchFieldAutocompleteComponent
  ],
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  exports: [
    SearchMaskComponent,
    SearchFieldAutocompleteComponent
  ],
  providers: [
    { provide: ApiService, useClass: PersistentCachedTamanduaService },
    { provide: CachedApiService, useExisting: ApiService },
    ToastrService
  ]
})
export class SearchMaskModule {
}
