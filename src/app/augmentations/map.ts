// we must force tsc to interpret this file as a module, resolves
// "Augmentations for the global scope can only be directly nested in external modules or ambient module declarations."
// error
export {};

declare global {
  interface Map<K, V> {
    toObject(): object;
  }
}


Map.prototype.toObject = function () {
  const obj = {};
  this.forEach((value, key) => obj[ key ] = value);
  return obj;
};
