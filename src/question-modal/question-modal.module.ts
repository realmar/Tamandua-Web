import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionModalComponent } from './question-modal.component';
import { MatButtonModule, MatDialogModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [ QuestionModalComponent ],
  declarations: [ QuestionModalComponent ]
})
export class QuestionModalModule {
}
