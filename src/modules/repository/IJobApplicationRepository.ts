import type JobApplication from '../model/jobApplication'

export default interface IJobApplicationRepository {
  addApplication(
    application: JobApplication,
    offerDetails: File | string
  ): Promise<JobApplication | undefined>
}
