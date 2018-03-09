import { getLocaleDateTimeFormat } from '@angular/common';

export class Converter {
  /* datetime format:
   * static readonly datetimeFormat = 'YYYY/MM/DD HH:mm:ss';
   */

  public static isStringTimeOnly (time: string): boolean {
    return time[ 2 ] === ':';
  }

  public static isStringDateOnly (date: string): boolean {
    return date[ 4 ] === '/' && date.length === 10;
  }

  // pure
  public static dateToString (datetime: Date): string {
    const fixStrLength = x => x.length === 2 ? x : '0' + x;

    return [
      datetime.getFullYear().toString(),
      '/',
      fixStrLength((datetime.getMonth() + 1).toString()),
      '/',
      fixStrLength(datetime.getDate().toString()),
      ' ',
      fixStrLength(datetime.getHours().toString()),
      ':',
      fixStrLength(datetime.getMinutes().toString()),
      ':',
      fixStrLength(datetime.getSeconds().toString())
    ].join('');
  }

  // pure
  public static stringToDate (datetimeString: string): Date {
    const dtSplit = datetimeString.split(' ');

    let date: string;
    let time: string;

    if (dtSplit.length === 1) {
      if (dtSplit[ 0 ][ 2 ] === ':') {
        time = dtSplit[ 0 ];
      } else {
        date = dtSplit[ 0 ];
      }
    } else {
      date = dtSplit[ 0 ];
      time = dtSplit[ 1 ];
    }

    let year = 1970, month = 0, day = 1, hours = 0, minutes = 0, seconds = 0;

    if (date !== undefined) {
      year = parseInt(date.substring(0, 4), 10);
      month = parseInt(date.substring(5, 7), 10) - 1;
      day = parseInt(date.substring(8, 10), 10);
    }

    if (time !== undefined) {
      hours = parseInt(time.substring(0, 2), 10);
      minutes = parseInt(time.substring(3, 5), 10);
      seconds = parseInt(time.substring(6, 8), 10);
    }

    return new Date(year, month, day, hours, minutes, seconds);
  }
}
