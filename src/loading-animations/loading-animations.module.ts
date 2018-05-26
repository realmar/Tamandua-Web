import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftToRightPulseComponent } from './left-to-right-pulse/left-to-right-pulse.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  exports: [
    LeftToRightPulseComponent
  ],
  declarations: [
    LeftToRightPulseComponent
  ]
})
export class LoadingAnimationsModule {
}
