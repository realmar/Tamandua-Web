import { isNullOrUndefined } from '../utils/misc';

export {};

declare global {
  interface ArrayConstructor {
    isEmptyNullOrUndefined<T> (arr: Array<T>): boolean;
  }

  interface Array<T> {
    clear (): void;

    removeAt (index: number): void;

    removeWhere (predicate: (value: T) => boolean): number;

    insert (index: number, value: T): void;

    distinct (): Array<T>;
  }
}

Array.isEmptyNullOrUndefined = function <T> (arr: Array<T>): boolean {
  return isNullOrUndefined(arr) || arr.length === 0;
};

Array.prototype.clear = function (): void {
  this.splice(0, this.length);
};

Array.prototype.removeAt = function (index: number): void {
  this.splice(index, 1);
};

Array.prototype.removeWhere = function <T> (predicate: (value: T) => boolean): number {
  const index = this.findIndex(predicate);
  if (index >= 0) {
    this.removeAt(index);
  }

  return index;
};

Array.prototype.insert = function <T> (index: number, value: T): void {
  this.splice(index, 0, value);
};

Array.prototype.distinct = function <T> (): Array<T> {
  const arr = [];
  const set = new Set<T>(this);
  set.forEach(value => arr.push(value));
  this.clear();
  this.push(...arr);
  return this;
};
