import type JobApplication from '../model/jobApplication'

export default interface IJobApplicationService {
  saveApplication(
    application: JobApplication,
    applicationFile: File | string
  ): Promise<JobApplication | undefined>
}
