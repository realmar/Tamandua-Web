import { MatTableDataSource } from '@angular/material';
import { Converter } from '../converter';
import { isNullOrUndefined } from 'util';

export class TamanduaTableDataSource<T> extends MatTableDataSource<T> {
  sortingDataAccessor: ((data: T, sortHeaderId: string) => string | number) =
    (data: T, sortHeaderId: string): string | number => {
      if (!isNullOrUndefined(data[ sortHeaderId ]) && sortHeaderId.endsWith('_time')) {
        return Converter.stringToDate(data[ sortHeaderId ]).getTime();
      } else {
        // Source: https://github.com/angular/material2/blob/master/src/lib/table/table-data-source.ts
        // We cannot just do super.sortingDataAccessor because
        // sortingDataAccessor is a property and not a method, so super
        // does not work, see: https://github.com/Microsoft/TypeScript/issues/4465
        const value: any = data[ sortHeaderId ];

        // If the value is a string and only whitespace, return the value.
        // Otherwise +value will convert it to 0.
        if (typeof value === 'string' && !value.trim()) {
          return value;
        }

        return isNaN(+value) ? value : +value;
      }
    };
}
