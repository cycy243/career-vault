import type JobApplication from '../model/jobApplication'

export default interface IJobApplicationRepository {
  addApplication(
    pseudo: string,
    application: JobApplication,
    offerDetails: File | string
  ): Promise<JobApplication | undefined>

  getApplications(uid: string): Promise<Array<JobApplication> | undefined>

  deleteApplication(applicationId: string): Promise<boolean>

  updateApplication(application: JobApplication): Promise<JobApplication | undefined>
}
