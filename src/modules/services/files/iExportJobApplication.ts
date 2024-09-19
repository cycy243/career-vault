import type JobApplication from '@/modules/model/jobApplication'

export default interface IExportJobApplication {
  exportToPdf(jobApplications: Array<JobApplication>): Promise<boolean>
}
