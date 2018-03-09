export abstract class PersistentStorageService {
  public abstract save (key: string, obj: any): void;

  public abstract load<T> (key: string, callback: (result: T, success: boolean) => void): void;
}
