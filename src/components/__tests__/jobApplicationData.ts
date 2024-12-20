import JobApplication from '@/modules/model/jobApplication';

export const spontaneaousApplication: JobApplication = JobApplication.createJobApplication({
  societyName: 'Test_Society',
  contactMail: 'test_contact@contact.com',
  sendDate: new Date()
});

export const normalApplication: JobApplication = JobApplication.createJobApplication({
  societyName: 'Test_Society',
  contactMail: 'test_contact@contact.com',
  jobTitle: 'Software defeloper',
  positiveReponse: false,
  sendDate: new Date(),
  applicationLink: 'https://www.truc.com'
});
