import type JobApplication from '@/modules/model/jobApplication'
import type IExportJobApplication from '../iExportJobApplication'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ServiceError from '../../errors/serviceError'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx-js-style'

const excelFileExtension = '.xlsx'
const pdfFileExtension = '.pdf'

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
        body: jobApplications.map(this.convertToArray),
        startY: 30
      })
      doc.save('job_tracking_' + new Date().toISOString().slice(0, 10) + '_' + Date.now() + '.pdf')
      return Promise.resolve(true)
    } catch (error) {
      throw new ServiceError('An error occured while exporting the PDF')
    }
  }

  exportToExcel(jobApplications: Array<JobApplication>): Promise<boolean> {
    try {
      const tabHeaders = [['Society name', "Job's title", 'Send date', 'Response date']]
      const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      const workBook = XLSX.utils.book_new()
      //Create a new Work Sheet using the data stored in an Array of Arrays.
      const workSheet = XLSX.utils.aoa_to_sheet(
        tabHeaders.concat(jobApplications.map(this.convertToArray))
      )
      workSheet['A1'].s = { font: { bold: true } }
      workSheet['B1'].s = { font: { bold: true } }
      workSheet['C1'].s = { font: { bold: true } }
      workSheet['D1'].s = { font: { bold: true } }
      XLSX.utils.book_append_sheet(workBook, workSheet, 'job tracking')
      // Exporting the file with the desired name and extension.
      const excelBuffer = XLSX.write(workBook, { bookType: 'xlsx', type: 'array' })
      const fileData = new Blob([excelBuffer], { type: fileType })
      FileSaver.saveAs(fileData, this.generateFileName() + excelFileExtension)
      return Promise.resolve(true)
    } catch (error) {
      throw new ServiceError('An error occured while exporting the PDF')
    }
  }

  generateFileName() {
    return 'job_tracking_' + new Date().toISOString().slice(0, 10) + '_' + Date.now()
  }

  convertToArray(application: JobApplication): Array<string> {
    const result = new Array<string>()
    result.push(application.societyName)
    result.push(application.jobTitle)
    result.push(application.sendDate?.toISOString().slice(0, 10) || 'Not yet')
    result.push(application.responseDate?.toISOString().slice(0, 10) || 'Not yet')
    return result
  }
}
