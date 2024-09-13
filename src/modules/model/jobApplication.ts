export default class JobApplication {
  constructor(
    public societyName: string,
    public jobTitle: string,
    public sendDate: Date,
    public positiveReponse: Boolean | undefined,
    public responseDate: Date | undefined
  ) {}
}
