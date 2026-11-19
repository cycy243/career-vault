import { describe, it, expect, beforeAll } from 'vitest';

import { mount, shallowMount } from '@vue/test-utils';
import JobApplication from '@/modules/model/jobApplication';
import JobApplicationTable from '@/components/table/JobApplicationTable.vue';
import IconDelete from '@/components/icons/IconDelete.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import { PrimeVue } from '@primevue/core';

const makeApplications = (count: number) =>
  Array.from(
    { length: count },
    (_, i) =>
      new JobApplication(
        `Fake post${i + 1}`,
        new Date(2024, 0, i + 1),
        new Date(),
        false,
        new Date(),
        undefined,
        `${i + 1}`,
        'linkedin'
      )
  );

/** Props for a table showing `page` (all its rows) out of `totalRecords` applications. */
const tableProps = (
  page: JobApplication[],
  totalRecords = page.length,
  currentPage = 0,
  rows = 15
) => ({
  jobApplications: page,
  totalRecords,
  currentPage,
  rows,
  sortField: 'sendDate' as const,
  ascending: false
});

describe('JobApplicationTable', () => {
  beforeAll(() => {
    // jsdom has no matchMedia; PrimeVue's Select (rows-per-page dropdown) needs it.
    window.matchMedia ??= (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }) as MediaQueryList;
  });

  const mountWithPrimeVue = (props: ReturnType<typeof tableProps>) =>
    mount(JobApplicationTable, { props, global: { plugins: [PrimeVue] } });

  it('renders one row per application of the page', () => {
    const wrapper = shallowMount(JobApplicationTable, { props: tableProps(makeApplications(5)) });
    expect(wrapper.findAll('tbody tr').length).toBe(5);
  });

  it('renders message when no applications', () => {
    const wrapper = shallowMount(JobApplicationTable, { props: tableProps([]) });
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(wrapper.text()).toContain('No application made yet');
  });

  it('emits "sort" with the column field when a header is clicked', async () => {
    const wrapper = shallowMount(JobApplicationTable, { props: tableProps(makeApplications(2)) });
    await wrapper.findAll('thead td')[0].trigger('click');
    await wrapper.findAll('thead td')[3].trigger('click');
    expect(wrapper.emitted('sort')).toEqual([['societyName'], ['responseDate']]);
  });

  describe('pagination', () => {
    const navButtons = [
      '.p-paginator-first',
      '.p-paginator-prev',
      '.p-paginator-next',
      '.p-paginator-last'
    ];
    const isDisabled = (wrapper: ReturnType<typeof mountWithPrimeVue>, selector: string) =>
      wrapper.find(selector).attributes('disabled') !== undefined;

    it('disables first/prev on the first page and emits "page" when going to the last', async () => {
      const wrapper = mountWithPrimeVue(tableProps(makeApplications(15), 40));

      expect(navButtons.map((s) => isDisabled(wrapper, s))).toEqual([true, true, false, false]);

      await wrapper.find('.p-paginator-last').trigger('click');
      expect(wrapper.emitted('page')).toEqual([[{ page: 2, rows: 15 }]]);
    });

    it('disables next/last on the last page', () => {
      const wrapper = mountWithPrimeVue(tableProps(makeApplications(10), 40, 2));
      expect(navButtons.map((s) => isDisabled(wrapper, s))).toEqual([false, false, true, true]);
    });

    it('shows only the current page and disables every button when there is one page', () => {
      const wrapper = mountWithPrimeVue(tableProps(makeApplications(5)));

      expect(wrapper.findAll('.p-paginator-page').length).toBe(1);
      expect(navButtons.every((s) => isDisabled(wrapper, s))).toBe(true);
    });

    it('displays at most five page links', () => {
      const wrapper = mountWithPrimeVue(tableProps(makeApplications(15), 200, 6));
      const pages = wrapper.findAll('.p-paginator-page').map((p) => p.text());
      expect(pages).toEqual(['5', '6', '7', '8', '9']);
    });

    it('does not render the paginator when there is no application', () => {
      const wrapper = mountWithPrimeVue(tableProps([]));
      expect(wrapper.find('.p-paginator').exists()).toBe(false);
    });
  });

  describe('emits test', () => {
    it('emits "delete" when delete icon is clicked', () => {
      const jobApplications = makeApplications(5);
      const wrapper = shallowMount(JobApplicationTable, { props: tableProps(jobApplications) });
      const rows = wrapper.findAllComponents(IconDelete);
      rows[0].trigger('click');
      rows[2].trigger('click');
      expect(wrapper.emitted('delete')).toEqual([['1'], [jobApplications[2].applicationId]]);
    });

    it('emits "update" when edit icon is clicked', () => {
      const jobApplications = makeApplications(5);
      const wrapper = shallowMount(JobApplicationTable, { props: tableProps(jobApplications) });
      const rows = wrapper.findAllComponents(IconEdit);
      rows[0].trigger('click');
      rows[2].trigger('click');
      expect(wrapper.emitted('update')).toEqual([[jobApplications[0]], [jobApplications[2]]]);
    });
  });
});
