import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TestComponent from './TestComponent.vue'
import { ErrorMessage, Field, Form } from 'vee-validate'

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

    await wrapper.find('input[name="email"]').setValue('test@test.com')

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(wrapper.emitted()).toHaveProperty('submit')
    })
  })
})
