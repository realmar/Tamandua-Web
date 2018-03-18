import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import 'rxjs/add/operator/takeWhile';

export class TimeoutUpdater {
  private _waitTime: number;
  private _action: () => void;
  private _passedTime: number;

  private _intervalTime: number;
  private _interval: Subscription;

  private _isRunning: boolean;
  public get isRunning (): boolean {
    return this._isRunning;
  }

  constructor (action: () => void, waitTime: number) {
    this._waitTime = waitTime;
    this._action = action;
    this._intervalTime = 100;
    this.reset();
  }

  public start () {
    this.reset();
    this._isRunning = true;

    this._interval = Observable.interval(this._intervalTime)
      .takeWhile(() => this._passedTime < this._waitTime)
      .subscribe(
        value => this._passedTime += this._intervalTime,
        error => {
          // console.log(error);
        },
        // for some reason `() => {}` does not capture `this` correctly ...
        function () {
          this._action();
          this.reset();
        }.bind(this));
  }

  public interrupt (): void {
    this._passedTime = 0;
  }

  public startOrInterrupt (): void {
    if (this.isRunning) {
      this.interrupt();
    } else {
      this.start();
    }
  }

  public reset (): void {
    this._isRunning = false;
    this._passedTime = 0;

    if (!isNullOrUndefined(this._interval)) {
      this._interval.unsubscribe();
    }
  }
}
