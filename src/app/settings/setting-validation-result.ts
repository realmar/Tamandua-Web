import { isNullOrUndefined } from '../../utils/misc';

export class SettingValidationResult {
  private readonly _isValid: boolean;
  public get isValid (): boolean {
    return this._isValid;
  }

  private readonly _messages: Array<string>;
  public get messages (): Array<string> {
    return this._messages;
  }

  constructor (isValid: boolean, ...messages: Array<string>) {
    if (isNullOrUndefined(messages)) {
      messages = [];
    }

    this._isValid = isValid;
    this._messages = messages;
  }
}
