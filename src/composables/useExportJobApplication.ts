import type JobApplication from '@/modules/model/jobApplication';
import ServiceError from '@/modules/services/errors/serviceError';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { utils, write as writeExcel } from 'xlsx-js-style';
import { toValue, type MaybeRefOrGetter } from 'vue';

const headers = ['Society name', "Job's title", 'Send date', 'Response date'];
const excelFileType =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

const generateFileName = () =>
  'job_tracking_' + new Date().toISOString().slice(0, 10) + '_' + Date.now();

const toRow = (application: JobApplication): Array<string> => [
  application.companyInformation.societyName,
  application.jobTitle ?? 'Spontaneous application',
  application.sendDate?.toISOString().slice(0, 10) || 'Not yet',
  application.responseDate?.toISOString().slice(0, 10) || 'Not yet'
];

/**
 * Exports job applications to PDF / Excel.
 * `source` can be a plain array, a ref or a getter: it is read at export time.
 * Both functions throw a `ServiceError` when the export fails.
 */
export const useExportJobApplication = (source: MaybeRefOrGetter<Array<JobApplication>>) => {
  const exportToPdf = async (): Promise<boolean> => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('Job tracking', doc.internal.pageSize.width / 4 + 60, 10, { align: 'center' });
      doc.setFontSize(11);
      doc.text('Tracking generated on ' + new Date().toDateString(), 10, 20);
      autoTable(doc, {
        head: [headers],
        body: toValue(source).map(toRow),
        startY: 30
      });
      doc.save(generateFileName() + '.pdf');
      return true;
    } catch (err) {
      console.error(err);
      throw new ServiceError('An error occured while exporting the PDF');
    }
  };

  const exportToExcel = async (): Promise<boolean> => {
    try {
      const workBook = utils.book_new();
      const workSheet = utils.aoa_to_sheet([headers, ...toValue(source).map(toRow)]);
      for (const cell of ['A1', 'B1', 'C1', 'D1']) workSheet[cell].s = { font: { bold: true } };
      utils.book_append_sheet(workBook, workSheet, 'job tracking');
      const excelBuffer = writeExcel(workBook, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer], { type: excelFileType }), generateFileName() + '.xlsx');
      return true;
    } catch (err) {
      console.error(err);
      throw new ServiceError('An error occured while exporting the Excel file');
    }
  };

  return { exportToPdf, exportToExcel };
};
