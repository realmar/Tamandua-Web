export class DashboardCardItemData {
  private _key;
  private _amount;
  private _totalAmount;

  get key () {
    return this._key;
  }

  get amount () {
    return this._amount;
  }

  get totalAmount () {
    return this._totalAmount;
  }

  constructor (label, amount, totalAmount) {
    this._key = label;
    this._amount = amount;
    this._totalAmount = totalAmount;
  }
}
