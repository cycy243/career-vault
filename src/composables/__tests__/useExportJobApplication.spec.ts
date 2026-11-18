import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import JobApplication from '@/modules/model/jobApplication';
import ServiceError from '@/modules/services/errors/serviceError';
import { useExportJobApplication } from '../useExportJobApplication';

const mocks = vi.hoisted(() => ({
  saveAs: vi.fn(),
  autoTable: vi.fn(),
  pdfSave: vi.fn()
}));

vi.mock('file-saver', () => ({ saveAs: mocks.saveAs }));
vi.mock('jspdf-autotable', () => ({ default: mocks.autoTable }));
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    internal: { pageSize: { width: 210 } },
    save: mocks.pdfSave
  }))
}));

const application = () =>
  JobApplication.createJobApplication({
    societyName: 'Corp',
    sendDate: new Date('2026-01-15T00:00:00Z')
  });

describe('useExportJobApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports the current value of the ref to PDF', async () => {
    const source = ref<JobApplication[]>([]);
    const { exportToPdf } = useExportJobApplication(source);
    source.value = [application()];

    expect(await exportToPdf()).toBe(true);
    expect(mocks.autoTable.mock.calls[0][1].body).toEqual([
      ['Corp', 'Spontaneous application', '2026-01-15', 'Not yet']
    ]);
    expect(mocks.pdfSave).toHaveBeenCalledWith(expect.stringMatching(/^job_tracking_.+\.pdf$/));
  });

  it('exports to Excel', async () => {
    const { exportToExcel } = useExportJobApplication(() => [application()]);

    expect(await exportToExcel()).toBe(true);
    expect(mocks.saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringMatching(/^job_tracking_.+\.xlsx$/)
    );
  });

  it('throws a ServiceError when the export fails', async () => {
    mocks.saveAs.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const { exportToExcel } = useExportJobApplication([application()]);

    await expect(exportToExcel()).rejects.toBeInstanceOf(ServiceError);
  });
});
