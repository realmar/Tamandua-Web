export abstract class DataCache<T> {
  abstract get isValid (): boolean;

  abstract get data (): T;
  abstract set data (value: T);

  abstract invalidate (): void;
}
