/** Page sizes offered for the job application list. The first one is the default. */
export const ROWS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

/** Table columns that can be sorted, mapped to the Firestore field path they order by. */
export const SORTABLE_FIELDS = {
  societyName: 'companyInformation.societyName',
  jobTitle: 'jobTitle',
  sendDate: 'sendDate',
  responseDate: 'responseDate',
  positiveReponse: 'positiveReponse',
  applicationLink: 'applicationLink'
} as const;

export type SortField = keyof typeof SORTABLE_FIELDS;
