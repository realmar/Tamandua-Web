export {};

declare global {
  interface ArrayConstructor {
    isEmptyNullOrUndefined<T> (arr: Array<T>): boolean;
  }

  interface Array<T> {
    clear ();
  }
}

Array.isEmptyNullOrUndefined = function <T> (arr: Array<T>): boolean {
  return !arr || arr.length === 0;
};

Array.prototype.clear = function (): void {
  this.splice(0, this.length);
};
