import { MatSort, MatTableDataSource } from '@angular/material';
import { Converter } from '../utils/converter';
import { isNullOrUndefined } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';

// copy pasta from https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts
// with added support for tamandua specific data (arrays, datetime as strings, undefined, null)
export class TamanduaTableDataSource<T> extends MatTableDataSource<T> {
  private convertValue (value: any, headerId: string): any {
    if (!isNullOrUndefined(value) && headerId.endsWith('_time') && value) {
      return Converter.stringToDate(value).getTime();
    } else {
      // If the value is a string and only whitespace, return the value.
      // Otherwise +value will convert it to 0.
      if (typeof value === 'string' && !value.trim()) {
        return value.toLowerCase();
      }

      return _isNumberValue(value) ? Number(value) : value;
    }
  }

  // Source: https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts#L100
  // We cannot just do super.sortingDataAccessor because
  // sortingDataAccessor is a property and not a method, so super
  // does not work, see: https://github.com/Microsoft/TypeScript/issues/4465
  sortingDataAccessor: ((data: T, sortHeaderId: string) => string | number) =
    (data: T, sortHeaderId: string): string | number => {
      const value = data[ sortHeaderId ];
      if (value instanceof Array) {
        // this is a rare case where I don't care about the type because I implicitly know what type
        // I'm working with. I cannot change the return type of this method as then it would
        // incorrectly extend the base class. Further down I also overwrite the sortData method
        // which makes use of this method. The sortData methods manually checks the type (if it is
        // an array or not) and handles the data accordingly.
        return value.map(v => this.convertValue(v, sortHeaderId)) as any as string | number;
      } else {
        return this.convertValue(value, sortHeaderId);
      }
    };

  sortData: ((data: T[], sort: MatSort) => T[]) = (data: T[], sort: MatSort): T[] => {
    // Source: https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts#L115
    // this implementation adds support for T potentially being an array and handles undefined or null data

    const active = sort.active;
    const direction = sort.direction;
    if (!active || direction === '') {
      return data;
    }

    const sorter = (a, b): number => {
      if (isNullOrUndefined(a) && !isNullOrUndefined(b)) {
        return 1;
      }

      if (isNullOrUndefined(b) && !isNullOrUndefined(a)) {
        return -1;
      }

      if (isNullOrUndefined(a) && isNullOrUndefined(b)) {
        return 0;
      }

      if (typeof a === 'string') {
        a = a.toLowerCase();
      }

      if (typeof b === 'string') {
        b = b.toLowerCase();
      }

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come first.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;
      if (a && b) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (a > b) {
          comparatorResult = 1;
        } else if (a < b) {
          comparatorResult = -1;
        }
      } else if (a) {
        comparatorResult = 1;
      } else if (b) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction === 'asc' ? 1 : -1);
    };

    return data.sort((a, b) => {
      const valueA = this.sortingDataAccessor(a, active) as any;
      const valueB = this.sortingDataAccessor(b, active) as any;

      let finalA: T;
      let finalB: T;

      if (valueA instanceof Array) {
        finalA = valueA.sort(sorter)[ 0 ];
      } else {
        finalA = valueA;
      }

      if (valueB instanceof Array) {
        finalB = valueB.sort(sorter)[ 0 ];
      } else {
        finalB = valueB;
      }

      return sorter(finalA, finalB);
    });
  };
}
