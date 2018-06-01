export {};

declare global {
  interface Set<T> {
    toArray (): Array<T>;
  }
}

Set.prototype.toArray = function <T> (): Array<T> {
  const arr = [];
  this.forEach(value => arr.push(value));
  return arr;
};
