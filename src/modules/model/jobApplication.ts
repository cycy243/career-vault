export default class JobApplication {
  constructor(
    public societyName: string,
    public jobTitle: string,
    public sendDate: Date | undefined,
    public positiveReponse: Boolean | undefined,
    public responseDate: Date | undefined,
    public applicationLink?: string
  ) {}
}
