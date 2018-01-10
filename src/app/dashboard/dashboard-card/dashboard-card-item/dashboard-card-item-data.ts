export class DashboardCardItemData {
  private _label;
  private _amount;
  private _totalAmount;

  get label () {
    return this._label;
  }

  get amount () {
    return this._amount;
  }

  get totalAmount () {
    return this._totalAmount;
  }

  constructor (label, amount, totalAmount) {
    this._label = label;
    this._amount = amount;
    this._totalAmount = totalAmount;
  }
}
