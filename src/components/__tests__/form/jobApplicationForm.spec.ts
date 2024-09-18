import { describe, it, expect, assert } from 'vitest'

import * as yup from 'yup'
import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import JobApplicationForm from '@/components/form/JobApplicationForm.vue'
import { nextTick } from 'vue'
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import JobApplication from '@/modules/model/jobApplication'

describe('JobApplicationForm test', () => {
  it('if form is empty or not valid then no submit is emmitted when button clicked', () => {
    const wrapper = shallowMount(JobApplicationForm)

    wrapper.find('form').trigger('submit')

    expect(wrapper.emitted()).not.toHaveProperty('submit')
  })

  //   it('emits event when submit', async () => {
  //     const wrapper = mount(JobApplicationForm)

  //     await wrapper.find('input[name="societyName"]').setValue('testo')
  //     await wrapper.find('input[name="jobTitle"]').setValue('testo')
  //     await wrapper.find('input[name="sendDate"]').setValue('2024-09-16')
  //     await wrapper.find('input[name="responseDate"]').setValue('2024-09-16')
  //     const checkbox = (await wrapper.find('input[name="isAccepted"]').element) as HTMLInputElement
  //     checkbox.checked = false
  //     await wrapper.find('input[name="isAccepted"]').trigger('change')
  //     await wrapper.find('input[name="offerDetails"]').setValue('kljhkljhkljh')

  //     await nextTick()

  //     console.log(
  //       'societyName:' + (wrapper.find('input[name="societyName"]').element as HTMLInputElement).value
  //     )
  //     console.log(
  //       'jobTitle:' + (wrapper.find('input[name="jobTitle"]').element as HTMLInputElement).value
  //     )
  //     console.log(
  //       'sendDate:' + (wrapper.find('input[name="sendDate"]').element as HTMLInputElement).value
  //     )
  //     console.log(
  //       'responseDate:' +
  //         (wrapper.find('input[name="responseDate"]').element as HTMLInputElement).value
  //     )
  //     console.log(
  //       'offerDetails:' +
  //         (wrapper.find('input[name="offerDetails"]').element as HTMLInputElement).value
  //     )
  //     console.log(
  //       'isAccepted:' + (wrapper.find('input[name="isAccepted"]').element as HTMLInputElement).value
  //     )
  //     // Wait for all promises to resolve
  //     await flushPromises()

  //     await wrapper.find('form').trigger('submit')
  //     // Wait for all promises to resolve
  //     await flushPromises()

  //     const emits = wrapper.emitted()
  //     console.log(emits)

  //     expect(emits).toHaveProperty('submit')
  //   })

  it("when a 'jobApplication' is gived then use it to complete form", () => {
    const application = new JobApplication(
      'Fake society4',
      'Fake post4',
      new Date(Date.now()),
      false,
      undefined,
      '',
      '4'
    )
    const wrapper = mount(JobApplicationForm, { props: { jobApplication: application } })

    expect((wrapper.find('input[name="societyName"]').element as HTMLInputElement).value).toBe(
      application.societyName
    )
    expect((wrapper.find('input[name="jobTitle"]').element as HTMLInputElement).value).toBe(
      application.jobTitle
    )

    expect((wrapper.find('input[name="sendDate"]').element as HTMLInputElement).value).toBe(
      application.sendDate?.toISOString().slice(0, 10)
    )
    assert.isEmpty((wrapper.find('input[name="responseDate"]').element as HTMLInputElement).value)
    expect((wrapper.find('input[name="isAccepted"]').element as HTMLInputElement).checked).toBe(
      application.positiveReponse
    )
    expect((wrapper.find('input[name="offerDetails"]').element as HTMLInputElement).value).toBe(
      application.applicationLink
    )
  })
})
