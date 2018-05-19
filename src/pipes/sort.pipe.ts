import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  public transform<T> (value: Array<T>, args?: (a: T, b: T) => number): any {
    return value.slice().sort(args);
  }
}
