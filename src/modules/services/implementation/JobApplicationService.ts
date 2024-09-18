import type JobApplication from '@/modules/model/jobApplication'
import type IJobApplicationService from '../IJobApplicationService'
import type IJobApplicationRepository from '@/modules/repository/IJobApplicationRepository'
import type { Auth } from 'firebase/auth'

export default class JobApplicationService implements IJobApplicationService {
  constructor(
    private jobApplicationRepository: IJobApplicationRepository,
    private firebaseAuth: Auth
  ) {}

  async saveApplication(
    application: JobApplication,
    applicationFile: File | string
  ): Promise<JobApplication | undefined> {
    if (application.applicationId === undefined) {
      return await this.jobApplicationRepository.addApplication(
        this.firebaseAuth.currentUser?.uid!,
        application,
        applicationFile
      )
    } else {
      return await this.jobApplicationRepository.updateApplication(application)
    }
  }
}
