type InitializedCallback = () => void;

export class InitializationCounter {
  private readonly _onInitialized: InitializedCallback;
  private readonly _expectedItemCount: number;
  private _currentItemCount: number;

  public constructor (expectedItemCount: number, onInitialized: InitializedCallback) {
    this._onInitialized = onInitialized;
    this._expectedItemCount = expectedItemCount;
    this._currentItemCount = 0;
  }

  public increment (): void {
    this._currentItemCount++;
    if (this._currentItemCount >= this._expectedItemCount) {
      this._onInitialized();
    }
  }
}
