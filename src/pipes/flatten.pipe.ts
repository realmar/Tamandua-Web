import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: false,
  name: 'flatten'
})
export class FlattenPipe implements PipeTransform {
  public static flatten<T> (arr: Array<T>): Array<any> {
    const flattened = [];

    arr.forEach(value => {
      if (value instanceof Array) {
        FlattenPipe.flatten(value).forEach(v => flattened.push(v));
      } else {
        flattened.push(value);
      }
    });

    return flattened;
  }

  public transform<T> (arr: Array<T>, args?: any): Array<any> {
    return FlattenPipe.flatten(arr);
  }
}
