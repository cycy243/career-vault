export default class JobApplication {
  constructor(
    public societyName: string,
    public jobTitle: string,
    public sendDate: Date | undefined,
    public positiveReponse: Boolean | undefined,
    public responseDate: Date | undefined,
    public applicationLink?: string,
    public applicationId?: string
  ) {}

  static createJobApplication(object: {
    societyName: string
    jobTitle: string
    sendDate: Date | undefined
    positiveReponse: Boolean | undefined
    responseDate: Date | undefined
    applicationLink?: string
    applicationId?: string
  }): JobApplication {
    return new JobApplication(
      object.societyName,
      object.jobTitle,
      object.sendDate,
      object.positiveReponse,
      object.responseDate,
      object.applicationLink,
      object.applicationId
    )
  }
}
