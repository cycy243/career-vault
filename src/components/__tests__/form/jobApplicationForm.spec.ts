import { describe, it, expect, assert } from 'vitest'

import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import JobApplicationForm from '@/components/form/JobApplicationForm.vue'
import { nextTick, provide } from 'vue'
import JobApplication from '@/modules/model/jobApplication'
import * as applications from '@/components/__tests__/jobApplicationData'
import { FormContextKey } from 'vee-validate'

/**
 * I don't test the "emit"
 */

describe('JobApplicationForm test', () => {
  it('if form is empty or not valid then no submit is emmitted when button clicked', async () => {
    const wrapper = shallowMount(JobApplicationForm)

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

    expect(wrapper.find('div:has(input[name="offerDetails"]) ~ .error_wrapper').text()).toBeTruthy()
  })

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

    expect(wrapper.find('div:has(input[name="offerDetails"]) ~ .error_wrapper').text()).toBeTruthy()
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

  it('complete form for spontaneous application and submit the application then no errors are displayed in the forms', async () => {
    const application = applications.spontaneaousApplication

    // Mount the component with an 'onSubmit' prop handler
    const wrapper = mount(JobApplicationForm)

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

    // Submit the form
    await wrapper.find('button').trigger('submit')

    await nextTick() // Make sure Vue has finished any async operations
    await flushPromises()

    expect(wrapper.findAll('.error_wrapper')).toHaveLength(0)
  })
})
