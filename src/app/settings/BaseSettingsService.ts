import { Observable, Subject } from 'rxjs';

export abstract class BaseSettingsService {
  private readonly _onFinishInitalizeSubject: Subject<any>;

  public get onFinishInitialize (): Observable<any> {
    return this._onFinishInitalizeSubject.asObservable();
  }

  protected _isInitialized: boolean;
  public get isInitialized (): boolean {
    return this._isInitialized;
  }

  protected constructor () {
    this._onFinishInitalizeSubject = new Subject<any>();
    this._isInitialized = false;
  }

  protected emitOnFinishInitialized (): void {
    this._isInitialized = true;
    this._onFinishInitalizeSubject.next();
  }
}
