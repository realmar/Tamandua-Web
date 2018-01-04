export class Converter {
  /* datetime format:
   * static readonly datetimeFormat = 'YYYY/MM/DD HH:mm:ss';
   */

  // pure
  public static dateToString (datetime: Date): string {

    return [
      datetime.getFullYear().toString(),
      '/',
      datetime.getMonth().toString(),
      '/',
      datetime.getDay().toString(),
      '/ ',
      datetime.getHours().toString(),
      ':',
      datetime.getMinutes().toString(),
      ':',
      datetime.getSeconds().toString()
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

    let year = 1970, month = 1, day = 1, hours = 0, minutes = 0, seconds = 0;

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
