export class User {
  constructor(
    private useRole: string,
    private userGroup: string,
    private userId: string,
    private userName: string,
    private _token: string,
    private expirationDate: number,
    private userCode: number
  ) {}

  get token() {
    if (new Date().getTime() > this.expirationDate) {
      return null;
    }
    return this._token;
  }
}
