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
import { ApiService } from '../app/api/api-service';
import { PersistentCachedTamanduaService } from '../app/api/persistent-cached-tamandua.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CachedApiService } from '../app/api/cached-api-service';

@NgModule({
  declarations: [
    SearchMaskComponent,
    SearchFieldComponent,
    SearchDatetimeComponent
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
    SearchMaskComponent
  ],
  providers: [
    { provide: ApiService, useClass: PersistentCachedTamanduaService },
    { provide: CachedApiService, useExisting: ApiService },
    ToastrService
  ]
})
export class SearchMaskModule {
}
