import { describe, it, expect, assert, vi } from 'vitest'

import { enableAutoUnmount, flushPromises, mount, shallowMount } from '@vue/test-utils'
import JobApplicationForm from '@/components/form/JobApplicationForm.vue'
import { nextTick, ref } from 'vue'
import JobApplication from '@/modules/model/jobApplication'
import { afterEach } from 'node:test'
import * as applications from '@/components/__tests__/jobApplicationData'

describe('JobApplicationForm test', () => {
  it('if form is empty or not valid then no submit is emmitted when button clicked', () => {
    const wrapper = shallowMount(JobApplicationForm)

    wrapper.find('form').trigger('submit')

    expect(wrapper.emitted()).not.toHaveProperty('submit')
    wrapper.unmount()
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

  it('when type is "job_offers" and form is submitting without being completed than there is an error for the offerDetails input', async () => {
    const wrapper = mount(JobApplicationForm)

    wrapper.find("input[value='job_offer']").trigger('click')
    wrapper.find("input[value='job_offer']").trigger('change')
    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeTruthy()

    await nextTick()
    await flushPromises()

    wrapper.find('button').trigger('submit')

    await nextTick()
    await flushPromises()

    expect(
      wrapper.find('div:has(input[name="offerDetails"]) ~ .errors-wrapper').text()
    ).toBeTruthy()
  })

  it("when a 'jobApplication' is gived then use it to complete form", async () => {
    const application = new JobApplication(
      'Fake society4',
      'Fake post4',
      'Fake trus',
      new Date(Date.now()),
      new Date(Date.now()),
      false,
      undefined,
      '',
      '4'
    )
    const wrapper = mount(JobApplicationForm, { props: { jobApplication: application } })

    wrapper.find("input[value='job_offer']").trigger('click')
    wrapper.find("input[value='job_offer']").trigger('change')
    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeTruthy()

    await nextTick()
    await flushPromises()

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

  it('when type is "spontaneous" and form is submitting without being completed than there are not error for field like "offerDetails"', async () => {
    const wrapper = mount(JobApplicationForm)

    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeFalsy()
    expect(
      (wrapper.find("input[value='spontaneous']").element as HTMLInputElement).checked
    ).toBeTruthy()

    await nextTick()
    await flushPromises()

    wrapper.find('form').trigger('submit')

    await nextTick()
    await flushPromises()

    expect(
      wrapper.find('div:has(input[name="offerDetails"]) ~ .errors-wrapper').exists()
    ).toBeFalsy()
  })

  it('complete form for spontaneous application and submit give the application', async () => {
    const application = applications.spontaneaousApplication
    const submittedApplication = ref<JobApplication | undefined>()
    const onSubmitSpy = vi.fn()

    // Mount the component with an 'onSubmit' prop handler
    const wrapper = mount(JobApplicationForm, { props: { onSubmit: onSubmitSpy } })
    const emitSpy = vi.spyOn(wrapper.vm, '$emit')

    await nextTick()
    await flushPromises()

    // Fill out form inputs
    await wrapper
      .find('input[name="societyName"]')
      .setValue(application.companyInformation!.societyName)
    await wrapper
      .find('input[name="sendDate"]')
      .setValue(application.sendDate?.toISOString().slice(0, 10))
    await wrapper.find('input[name="contactEmail"]').setValue(application.contactInformation?.mail)

    // Click the checkbox and ensure it's checked
    const isAcceptedCheckbox = wrapper.find("input[name='isAccepted']")
    await isAcceptedCheckbox.trigger('click')
    await isAcceptedCheckbox.trigger('change')
    expect((isAcceptedCheckbox.element as HTMLInputElement).checked).toBeTruthy()

    await flushPromises()

    // Submit the form
    await wrapper.find('button').trigger('submit')
    wrapper.vm.$forceUpdate()
    await nextTick() // Make sure Vue has finished any async operations
    await flushPromises()

    // Debugging outputs to check state
    const formApplication = wrapper.emitted()
    console.log('Form emitted events:', formApplication)
    console.log('Submitted application:', (formApplication['submit']?.[0] as unknown[])?.[0])

    // Assert that the application was received by the onSubmit callback
    expect(onSubmitSpy).toHaveBeenCalled()
    expect(submittedApplication.value).toBeDefined()
  })
})
