import type JobApplication from '@/modules/model/jobApplication'
import type IExportJobApplication from '../iExportJobApplication'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default class ExportJobApplication implements IExportJobApplication {
  exportToPdf(jobApplications: Array<JobApplication>): Promise<boolean> {
    try {
      const doc = new jsPDF()
      const headers = ['Society name', "Job's title", 'Send date', 'Response date']
      autoTable(doc, {
        head: [headers],
        body: jobApplications.map(this.convertToArray)
      })
      doc.save(new Date().getMilliseconds() + '.pdf')
      return Promise.resolve(true)
    } catch (error) {
      throw new ServiceError('An error occured while exporting the PDF')
    }
  }

  convertToArray(application: JobApplication): Array<string> {
    const result = new Array<string>()
    result.push(application.societyName)
    result.push(application.jobTitle)
    result.push(application.sendDate?.toDateString() || 'Not yet')
    result.push(application.responseDate?.toDateString() || 'Not yet')
    return result
  }
}
