import { describe, it, expect, assert, vi } from 'vitest';

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import JobApplicationForm from '@/components/form/JobApplicationForm.vue';
import { nextTick } from 'vue';
import * as applications from '@/components/__tests__/jobApplicationData';
import { PrimeVue } from '@primevue/core';

/**
 * I don't test the "emit"
 */

describe('JobApplicationForm test', () => {
  it('if form is empty or not valid then no submit is emmitted when button clicked', async () => {
    const wrapper = mount(JobApplicationForm, {
      global: {
        plugins: [PrimeVue],
      },
    });
    
    await wrapper.find("input[value='job_offer']").setValue();

    await nextTick();
    await flushPromises();

    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeTruthy();

    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => {
      expect(wrapper.find('input[name="offerDetails"] ~ .error_wrapper').exists()).toBeTruthy();
    });
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('when type is "job_offers" and form is submitting without being completed than there is an error for the offerDetails input', async () => {
    const wrapper = mount(JobApplicationForm);

    wrapper.find("input[value='job_offer']").trigger('click');
    wrapper.find("input[value='job_offer']").trigger('change');
    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeTruthy();

    await nextTick();
    await flushPromises();

    wrapper.find('button').trigger('submit');

    await vi.waitFor(() => {
      expect(wrapper.find('input[name="offerDetails"] ~ .error_wrapper').exists()).toBeTruthy();
    });
  });

  it("when a 'jobApplication' is gived then use it to complete form", async () => {
    const application = applications.normalApplication;
    const wrapper = mount(JobApplicationForm, { props: { jobApplication: application } });

    wrapper.find("input[value='job_offer']").trigger('click');
    wrapper.find("input[value='job_offer']").trigger('change');
    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeTruthy();

    await nextTick();
    await flushPromises();

    expect(
      (wrapper.find('input[name="societyName"]').element as HTMLInputElement).value,
      'Expect societyName not to be undefined'
    ).toBe(application.companyInformation?.societyName);
    expect(
      (wrapper.find('input[name="jobTitle"]').element as HTMLInputElement).value,
      'Expect jobTitle to be undefined'
    ).toBe(application.jobTitle);

    expect((wrapper.find('input[name="sendDate"]').element as HTMLInputElement).value).toBe(
      application.sendDate?.toISOString().slice(0, 10)
    );
    assert.isEmpty((wrapper.find('input[name="responseDate"]').element as HTMLInputElement).value);
    expect((wrapper.find("div:has(label[for='isAccepted']) input").element as HTMLInputElement).checked).toBe(
      application.positiveReponse
    );
  });

  it('when type is "spontaneous" and form is submitting without being completed than there are not error for field like "offerDetails"', async () => {
    const wrapper = mount(JobApplicationForm);

    expect(
      (wrapper.find("input[value='job_offer']").element as HTMLInputElement).checked
    ).toBeFalsy();
    expect(
      (wrapper.find("input[value='spontaneous']").element as HTMLInputElement).checked
    ).toBeTruthy();

    await nextTick();
    await flushPromises();

    wrapper.find('form').trigger('submit');

    await nextTick();
    await flushPromises();

    expect(
      wrapper.find('div:has(input[name="offerDetails"]) ~ .errors-wrapper').exists()
    ).toBeFalsy();
  });

  it('complete form for spontaneous application and submit the application then no errors are displayed in the forms', async () => {
    const application = applications.spontaneaousApplication;

    // Mount the component with an 'onSubmit' prop handler
    const wrapper = mount(JobApplicationForm, {
      global: {
        plugins: [PrimeVue],
      },
    });

    // Fill out form inputs
    await wrapper
      .find('input[name="societyName"]')
      .setValue(application.companyInformation!.societyName);
    await wrapper
      .find('input[name="sendDate"]')
      .setValue(application.sendDate?.toISOString().slice(0, 10));
    await wrapper.find('input[name="contactEmail"]').setValue(application.contactInformation?.mail);

    // Click the checkbox and ensure it's checked
    console.log(wrapper.html());

    const isAcceptedCheckbox = wrapper.find("div:has(label[for='isAccepted']) input");
    await isAcceptedCheckbox.trigger('click');
    await isAcceptedCheckbox.trigger('change');
    expect((isAcceptedCheckbox.element as HTMLInputElement).checked).toBeTruthy();

    // Submit the form
    await wrapper.find('button').trigger('submit');

    await vi.waitFor(() => {
      expect(wrapper.findAll('.error_wrapper')).toHaveLength(0);
    });
  });
});
