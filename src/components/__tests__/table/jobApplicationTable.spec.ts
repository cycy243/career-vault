import { describe, it, expect, beforeEach } from 'vitest';

import { mount, shallowMount } from '@vue/test-utils';
import HelloWorld from '../../HelloWorld.vue';
import JobApplication from '@/modules/model/jobApplication';
import JobApplicationTable from '@/components/table/JobApplicationTable.vue';
import IconDelete from '@/components/icons/IconDelete.vue';
import IconEdit from '@/components/icons/IconEdit.vue';

describe('HelloWorld', () => {
  it('renders properly', () => {
    const jobApplications = [
      new JobApplication(
        'Fake society1',
        new Date(),
        new Date(),
        false,
        new Date(),
        'Fake post1',
        '1',
        'linkedin'
      ),
      new JobApplication(
        'Fake society2',
        new Date(),
        new Date(),
        false,
        new Date(),
        'Fake post2',
        '2',
        'linkedin'
      ),
      new JobApplication(
        'Fake society3',
        new Date(),
        new Date(),
        false,
        new Date(),
        'Fake post3',
        '3',
        'website'
      ),
      new JobApplication(
        'Fake society4',
        new Date(),
        new Date(),
        false,
        new Date(),
        'Fake post4',
        '4',
        'email'
      ),
      new JobApplication(
        'Fake society5',
        new Date(),
        new Date(),
        false,
        new Date(),
        'Fake post5',
        '5',
        'email'
      )
    ];
    const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } });
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(jobApplications.length);
  });
  it('renders message when no applications', () => {
    const jobApplications = Array<JobApplication>();
    const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } });
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(wrapper.text()).toContain('No application made yet');
  });
  describe('emits test', () => {
    let jobApplications = Array<JobApplication>(0);
    beforeEach(() => {
      jobApplications = [
        new JobApplication(
          'Fake society1',
          new Date(),
          new Date(),
          false,
          new Date(),
          'Fake post1',
          '1',
          undefined
        ),
        new JobApplication(
          'Fake society2',
          new Date(),
          new Date(),
          false,
          new Date(),
          'Fake post2',
          '2',
          undefined
        ),
        new JobApplication(
          'Fake society3',
          new Date(),
          new Date(),
          false,
          new Date(),
          'Fake post3',
          '3',
          undefined
        ),
        new JobApplication(
          'Fake society4',
          new Date(),
          new Date(),
          false,
          new Date(),
          'Fake post4',
          '4',
          undefined
        ),
        new JobApplication(
          'Fake society5',
          new Date(),
          new Date(),
          false,
          new Date(),
          'Fake post5',
          '5',
          undefined
        )
      ];
    });

    it('emits "delete" when delete icon is clicked', () => {
      const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } });
      const rows = wrapper.findAllComponents(IconDelete);
      rows[0].trigger('click');
      const emits = wrapper.emitted('delete');
      expect(emits).toHaveLength(1);
      expect(emits![0]).toEqual(['1']);
      rows[2].trigger('click');
      const emits2 = wrapper.emitted('delete');
      expect(emits2).toHaveLength(2);
      expect(emits2![1]).toEqual([jobApplications[2].applicationId]);
    });

    it('emits "update" when edit icon is clicked', () => {
      const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } });
      const rows = wrapper.findAllComponents(IconEdit);
      rows[0].trigger('click');
      const emits = wrapper.emitted('update');
      expect(emits).toHaveLength(1);
      expect((emits![0] as JobApplication[])[0]).toEqual(jobApplications[0]);
      rows[2].trigger('click');
      const emits2 = wrapper.emitted('update');
      expect(emits2).toHaveLength(2);
      expect((emits2![1] as JobApplication[])[0]).toEqual(jobApplications[2]);
    });
  });
});
