import { Pipe, PipeTransform } from '@angular/core';
import { HighlightedWords } from './highlighted-words';
import * as escapeStringRegexp from 'escape-string-regexp';

@Pipe({
  name: 'formatLogline'
})
export class FormatLoglinePipe implements PipeTransform {
  private escapeDiamonds (value: string): string {
    return value.replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  public transform (value: any, highlighted: HighlightedWords): any {
    let formatted = this.escapeDiamonds(value);

    const pieces = formatted.split(' ');
    const dateHostService = pieces.slice(0, 5).join(' ');
    const rest = pieces.slice(5, pieces.length).join(' ');

    formatted = `<span class="code-date-host-service">${dateHostService}</span> ${rest}`;
    highlighted.words.forEach((color, word) => {
      const escapedWord = this.escapeDiamonds(word);

      formatted = formatted.replace(
        new RegExp(escapeStringRegexp(escapedWord), 'gi'),
        `<span style=\"background-color: ${color.hex()};\">${escapedWord}</span>`);
    });

    return formatted;
  }
}
