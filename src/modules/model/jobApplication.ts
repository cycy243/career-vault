import type { CompanyInformation } from './companyInformation';
import type { ContactInformation } from './contactInformation';

export default class JobApplication {
  public companyInformation: CompanyInformation = null!;
  public contactInformation?: ContactInformation;
  public isSpontaneous: boolean = false;

  constructor(
    public jobTitle: string | undefined,
    public sendDate: Date | undefined,
    public interviewDate: Date | undefined,
    public positiveReponse: boolean | undefined,
    public responseDate: Date | undefined,
    public applicationLink?: string,
    public applicationId?: string,
    public applicationMethod?: 'email' | 'website' | 'linkedin',
    public webSiteApply?: string
  ) {}

  static createJobApplication(object: {
    societyName: string;
    societyWebsite?: string;
    contactName?: string;
    contactMail?: string;
    contactFunction?: string;
    jobTitle?: string;
    sendDate?: Date;
    interviewDate?: Date;
    positiveReponse?: boolean;
    responseDate?: Date;
    applicationLink?: string;
    applicationId?: string;
    applicationMethod?: 'email' | 'website' | 'linkedin';
    webSiteApply?: string;
  }): JobApplication {
    const application = new JobApplication(
      object.jobTitle,
      object.sendDate,
      object.interviewDate,
      object.positiveReponse,
      object.responseDate,
      object.applicationLink,
      object.applicationId,
      object.applicationMethod,
      object.webSiteApply
    );

    application.companyInformation = {
      societyName: object.societyName ?? '',
      societyWebsite: object.societyWebsite ?? ''
    };
    if (object.applicationMethod === 'email') {
      application.contactInformation = {
        function: object.contactFunction,
        mail: object.contactMail!,
        name: object.contactName
      };
    } else if (object.applicationMethod === 'website') {
      application.contactInformation = undefined;
    }
    application.isSpontaneous = !object.jobTitle || object.jobTitle.length === 0;

    return application;
  }
}
