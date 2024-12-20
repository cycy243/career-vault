import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TestComponent from './TestComponent.vue'
import { ErrorMessage, Field, Form } from 'vee-validate'
import { nextTick } from 'vue'

// TODO: write something similar to vee validate and see if the test passes
// TODO: create hooks for filed and form validation using a schema

describe('', () => {
  it('a component test submit', async () => {
    const wrapper = mount(TestComponent, {
      global: {
        components: {
          VForm: Form,
          VField: Field,
          VErrorMessage: ErrorMessage
        }
      }
    })

    await nextTick()
    await flushPromises()

    wrapper.find('input[name="email"]').setValue('test@test.com')

    await nextTick()
    await flushPromises()

    wrapper.find('button').trigger('submit')

    await nextTick()
    await flushPromises()

    console.log(wrapper.html())

    console.log(wrapper.emitted())

    expect(wrapper.emitted()).toHaveProperty('submit')
  })
})
