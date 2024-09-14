import { describe, it, expect } from 'vitest'

import { mount, shallowMount } from '@vue/test-utils'
import HelloWorld from '../../HelloWorld.vue'
import JobApplication from '@/modules/model/jobApplication'
import JobApplicationTable from '@/components/table/JobApplicationTable.vue'

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
    expect(rows.length).toBe(jobApplications.length)
    expect(wrapper.text()).toContain('No application made yet')
  })
})
