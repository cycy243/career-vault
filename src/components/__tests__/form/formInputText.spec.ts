import type { FormInputProps } from '@/components/form/FormInput.vue'
import FormInput from '@/components/form/FormInput.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('FormInputTextTests', () => {
  describe('emit events', () => {
    it('when input value then update is emitted', async () => {
      const props: FormInputProps<string> = {
        name: 'test_input',
        title: 'Test input',
        type: 'text',
        defaultValue: 'default'
      }
      const wrapper = mount(FormInput, { props })

      await nextTick()

      wrapper.find('input').setValue('coucou')

      await nextTick()

      expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    })
  })
})
