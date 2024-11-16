import type { CompanyInformation } from './companyInformation'
import type { ContactInformation } from './contactInformation'

export default class JobApplication {
  public companyInformation?: CompanyInformation
  public contactInformation?: ContactInformation
  public isSpontaneous: boolean = false

  constructor(
    public societyName: string,
    public societyWebsite: string | undefined,
    public jobTitle: string | undefined,
    public sendDate: Date | undefined,
    public interviewDate: Date | undefined,
    public positiveReponse: boolean | undefined,
    public responseDate: Date | undefined,
    public applicationLink?: string,
    public applicationId?: string
  ) {}

  static createJobApplication(object: {
    societyName: string
    societyWebsite?: string
    contactName?: string
    contactMail?: string
    contactFunction?: string
    jobTitle?: string
    sendDate?: Date
    interviewDate?: Date
    positiveReponse?: boolean
    responseDate?: Date
    applicationLink?: string
    applicationId?: string
  }): JobApplication {
    const application = new JobApplication(
      object.societyName,
      object.societyWebsite,
      object.jobTitle,
      object.sendDate,
      object.interviewDate,
      object.positiveReponse,
      object.responseDate,
      object.applicationLink,
      object.applicationId
    )

    application.companyInformation = {
      societyName: object.societyName,
      societyWebsite: object.societyWebsite
    }
    application.contactInformation = {
      function: object.contactFunction ?? '',
      mail: object.contactMail ?? '',
      name: object.contactName ?? ''
    }
    application.isSpontaneous = !object.jobTitle || object.jobTitle.length === 0

    return application
  }
}
