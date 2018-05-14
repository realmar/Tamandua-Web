import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { QuestionModalAction } from './question-modal-action';
import { QuestionModalData } from './question-modal-data';
import { isNullOrUndefined } from '../utils/misc';

@Component({
  selector: 'question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: [ './question-modal.component.scss' ]
})
export class QuestionModalComponent implements OnInit {
  private _title: string;
  private _text: string;
  private _actions: Array<QuestionModalAction>;

  public get actions (): Array<QuestionModalAction> {
    return this._actions;
  }

  @Input()
  public set actions (value: Array<QuestionModalAction>) {
    if (isNullOrUndefined(value) || value.length <= 0) {
      throw new Error('actions must contain elements.');
    }

    this._actions = value;
  }

  public get title (): string {
    return this._title;
  }

  @Input()
  public set title (value: string) {
    this._title = value;
  }

  public get text (): string {
    return this._text;
  }

  @Input()
  public set text (value: string) {
    this._text = value;
  }

  public constructor (private _dialogRef: MatDialogRef<QuestionModalComponent>,
                      @Inject(MAT_DIALOG_DATA) private _dialogData: QuestionModalData) {
    this.actions = _dialogData.actions;
    this.title = _dialogData.title;
    this.text = _dialogData.text;
  }

  public ngOnInit () {
  }

  public onActionPress (action: QuestionModalAction): void {
    action.callback();
  }
}
