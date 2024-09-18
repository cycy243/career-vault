import { describe, it, expect, beforeEach } from 'vitest'

import { mount, shallowMount } from '@vue/test-utils'
import HelloWorld from '../../HelloWorld.vue'
import JobApplication from '@/modules/model/jobApplication'
import JobApplicationTable from '@/components/table/JobApplicationTable.vue'
import IconDelete from '@/components/icons/IconDelete.vue'
import IconEdit from '@/components/icons/IconEdit.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const jobApplications = [
      new JobApplication('Fake society1', 'Fake post1', new Date(), undefined, undefined, ''),
      new JobApplication('Fake society2', 'Fake post2', new Date(), undefined, undefined, ''),
      new JobApplication('Fake society3', 'Fake post3', new Date(), undefined, undefined, ''),
      new JobApplication('Fake society4', 'Fake post4', new Date(), undefined, undefined, ''),
      new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined, '')
    ]
    const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(jobApplications.length)
  })
  it('renders message when no applications', () => {
    const jobApplications = Array<JobApplication>()
    const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(1)
    expect(wrapper.text()).toContain('No application made yet')
  })
  describe('emits test', () => {
    let jobApplications = Array<JobApplication>(0)
    beforeEach(() => {
      jobApplications = [
        new JobApplication(
          'Fake society1',
          'Fake post1',
          new Date(),
          undefined,
          undefined,
          '',
          '1'
        ),
        new JobApplication(
          'Fake society2',
          'Fake post2',
          new Date(),
          undefined,
          undefined,
          '',
          '2'
        ),
        new JobApplication(
          'Fake society3',
          'Fake post3',
          new Date(),
          undefined,
          undefined,
          '',
          '3'
        ),
        new JobApplication(
          'Fake society4',
          'Fake post4',
          new Date(),
          undefined,
          undefined,
          '',
          '4'
        ),
        new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined, '', '5')
      ]
    })

    it('emits "delete" when delete icon is clicked', () => {
      const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } })
      const rows = wrapper.findAllComponents(IconDelete)
      rows[0].trigger('click')
      const emits = wrapper.emitted('delete')
      expect(emits).toHaveLength(1)
      expect(emits![0]).toEqual(['1'])
      rows[2].trigger('click')
      const emits2 = wrapper.emitted('delete')
      expect(emits2).toHaveLength(2)
      expect(emits2![1]).toEqual([jobApplications[2].applicationId])
    })

    it('emits "update" when edit icon is clicked', () => {
      const wrapper = shallowMount(JobApplicationTable, { props: { jobApplications } })
      const rows = wrapper.findAllComponents(IconEdit)
      rows[0].trigger('click')
      const emits = wrapper.emitted('update')
      expect(emits).toHaveLength(1)
      expect((emits![0] as JobApplication[])[0]).toEqual(jobApplications[0])
      rows[2].trigger('click')
      const emits2 = wrapper.emitted('update')
      expect(emits2).toHaveLength(2)
      expect((emits2![1] as JobApplication[])[0]).toEqual(jobApplications[2])
    })
  })
})
