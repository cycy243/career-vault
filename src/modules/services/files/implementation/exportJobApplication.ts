import type JobApplication from '@/modules/model/jobApplication'
import type IExportJobApplication from '../iExportJobApplication'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ServiceError from '../../errors/serviceError'

export default class ExportJobApplication implements IExportJobApplication {
  exportToPdf(jobApplications: Array<JobApplication>): Promise<boolean> {
    try {
      const doc = new jsPDF()
      const headers = ['Society name', "Job's title", 'Send date', 'Response date']
      doc.setFontSize(22)
      doc.text('Job tracking', doc.internal.pageSize.width / 4 + 60, 10, { align: 'center' })
      doc.setFontSize(11)
      doc.text('Tracking generated on ' + new Date().toDateString(), 10, 20)
      autoTable(doc, {
        head: [headers],
        body: jobApplications.map(this.convertToArrayForPDF),
        startY: 30
      })
      doc.save('job_tracking_' + new Date().toISOString().slice(0, 10) + '_' + Date.now() + '.pdf')
      return Promise.resolve(true)
    } catch (error) {
      throw new ServiceError('An error occured while exporting the PDF')
    }
  }

  convertToArrayForPDF(application: JobApplication): Array<string> {
    const result = new Array<string>()
    result.push(application.societyName)
    result.push(application.jobTitle)
    result.push(application.sendDate?.toISOString().slice(0, 10) || 'Not yet')
    result.push(application.responseDate?.toISOString().slice(0, 10) || 'Not yet')
    return result
  }
}
