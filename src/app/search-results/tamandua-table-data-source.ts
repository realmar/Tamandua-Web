import { MatSort, MatTableDataSource } from '@angular/material';
import { Converter } from '../utils/converter';
import { isNullOrUndefined } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';

// copy pasta from https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts
// with added support for tamandua specific data (arrays, datetime as strings, undefined, null)
export class TamanduaTableDataSource<T> extends MatTableDataSource<T> {
  sortingDataAccessor: ((data: T, sortHeaderId: string) => string | number) =
    (data: T, sortHeaderId: string): string | number => {
      if (!isNullOrUndefined(data[ sortHeaderId ]) && sortHeaderId.endsWith('_time') && data[ sortHeaderId ]) {
        return Converter.stringToDate(data[ sortHeaderId ]).getTime();
      } else {
        // Source: https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts#L100
        // We cannot just do super.sortingDataAccessor because
        // sortingDataAccessor is a property and not a method, so super
        // does not work, see: https://github.com/Microsoft/TypeScript/issues/4465
        const value: any = data[ sortHeaderId ];

        // If the value is a string and only whitespace, return the value.
        // Otherwise +value will convert it to 0.
        if (typeof value === 'string' && !value.trim()) {
          return value.toLowerCase();
        }

        return _isNumberValue(value) ? Number(value) : value;
      }
    };

  sortData: ((data: T[], sort: MatSort) => T[]) = (data: T[], sort: MatSort): T[] => {
    // Source: https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts#L115
    // this implementation adds support for T potentially being an array

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
