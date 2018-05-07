import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Mark HTML snippet as save. Allows having attributes on html elements.
 *
 * Source: https://stackoverflow.com/questions/39628007/angular2-innerhtml-binding-remove-style-attribute
 */
@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  constructor (private _sanitized: DomSanitizer) {
  }

  transform (value: any, args?: any): any {
    return this._sanitized.bypassSecurityTrustHtml(value);
  }

}
