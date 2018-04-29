export {};

declare global {
  interface StringConstructor {
    isEmptyNullOrUndefined (str: string): boolean;
  }
}

String.isEmptyNullOrUndefined = function (str: string): boolean {
  return !str;
};
