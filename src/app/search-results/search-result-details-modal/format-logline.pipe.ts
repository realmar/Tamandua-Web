import { Pipe, PipeTransform } from '@angular/core';
import { HighlightedWords } from './highlighted-words';

@Pipe({
  name: 'formatLogline'
})
export class FormatLoglinePipe implements PipeTransform {
  public transform (value: any, highlighted: HighlightedWords): any {
    let formatted = value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const pieces = formatted.split(' ');
    const dateHostService = pieces.slice(0, 5).join(' ');
    const rest = pieces.slice(5, pieces.length).join(' ');

    formatted = `<span class="code-date-host-service">${dateHostService}</span> ${rest}`;
    highlighted.words.forEach((color, word) => {
      formatted = formatted.replace(
        new RegExp(word, 'g'),
        `<span style=\"background-color: ${color.hex()};\">${word}</span>`);
    });

    return formatted;
  }
}
