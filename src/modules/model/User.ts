export default class User {
  constructor(
    public lastname: string,
    public firstname: string,
    public pseudo: string,
    public email: string,
    public password: string,
    public uid?: string | undefined
  ) {}
}
