export function isNullOrUndefined<T> (value: T): boolean {
  return value === null || value === undefined;
}

export function toFloat (value: string | number): number {
  if (
    typeof value === 'string' &&
    !String.isEmptyNullOrUndefined(value) &&
    !isNaN(value as any)) {
    return parseFloat(value as string);
  }

  return value as number;
}
