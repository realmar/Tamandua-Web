import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveObjectComponent } from './save-object.component';
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,

    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [ SaveObjectComponent ],
  declarations: [ SaveObjectComponent ]
})
export class SaveObjectModule {
}
