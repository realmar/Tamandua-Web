export {};

declare global {
  interface ArrayConstructor {
    isEmptyNullOrUndefined<T> (arr: Array<T>): boolean;
  }
}

Array.isEmptyNullOrUndefined = function <T> (arr: Array<T>): boolean {
  return !arr || arr.length === 0;
};
