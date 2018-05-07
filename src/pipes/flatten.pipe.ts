import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: false,
  name: 'flatten'
})
export class FlattenPipe implements PipeTransform {
  public transform<T> (arr: Array<T>, args?: any): Array<any> {
    const flattened = [];

    arr.forEach(value => {
      if (value instanceof Array) {
        this.transform(value).forEach(v => flattened.push(v));
      } else {
        flattened.push(value);
      }
    });

    return flattened;
  }
}
