import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'animation-left-to-right-pulse',
  templateUrl: './left-to-right-pulse.component.html',
  styleUrls: [ './left-to-right-pulse.component.scss' ],
  animations: [
    // https://github.com/leonardopaiva/angular-animation-basic-project/blob/master/src/app/loop-demo/loop-demo.component.ts
    trigger('loading', [
      transition('loop => start', []),
      transition('* => loop', [
        style({
          width: 0,
          opacity: 1
        }),
        // https://easings.net/#easeOutCubic
        animate('1.5s cubic-bezier(0.215, 0.61, 0.355, 1)', style({
          width: '100%',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class LeftToRightPulseComponent {
  private _isLooping = false;
  public get isLooping (): boolean {
    return this._isLooping;
  }

  public set isLooping (value: boolean) {
    this._isLooping = value;
    if (value) {
      this._state = 'loop';
    }
  }

  private _state: string;
  public get state (): string {
    return this._state;
  }

  public constructor () {
    this._isLooping = false;
    this._state = 'start';
  }

  public onAnimationDone (event: any) {
    if (event[ 'fromState' ] !== 'void' && this.isLooping) {
      setTimeout(() => {
        this.state === 'start' ? this._state = 'loop' : this._state = 'start';
      }, 0);
    } else {
      this._state = undefined;
    }
  }
}
