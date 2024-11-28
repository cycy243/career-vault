import type { FormGroupInputRadioOptions } from '@/components/form/FormGroupInputRadio.vue'
import FormInputRadio from '@/components/form/FormInputRadio.vue'
import { mount, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, it, expect, assert } from 'vitest'
import FormGroupInputRadio from '@/components/form/FormGroupInputRadio.vue'

describe('FormGroupInputRadioTests', () => {
  describe('props initialisation', () => {
    it('three options passed then three radio input are rendered', async () => {
      const options: Array<FormGroupInputRadioOptions> = [
        { inputValue: 'one', value: 'one', id: 'one' },
        { inputValue: 'two', value: 'two', id: 'two' },
        { inputValue: 'three', value: 'three', id: 'three' }
      ]
      const wrapper = mount(FormGroupInputRadio, {
        props: { options, label: 'test input', value: 'one', input_name: 'test_input' }
      })

      await nextTick()

      expect(wrapper.findAllComponents(FormInputRadio)).toHaveLength(3)
    })

    it('when five options passed then five radio inputs are rendered', async () => {
      const options: Array<FormGroupInputRadioOptions> = [
        { inputValue: 'one', value: 'one', id: 'one' },
        { inputValue: 'two', value: 'two', id: 'two' },
        { inputValue: 'three', value: 'three', id: 'three' },
        { inputValue: 'four', value: 'four', id: 'four' },
        { inputValue: 'five', value: 'five', id: 'five' }
      ]
      const wrapper = mount(FormGroupInputRadio, {
        props: { options, label: 'test input', value: 'one', input_name: 'test_input' }
      })

      await nextTick()

      expect(wrapper.findAllComponents(FormInputRadio)).toHaveLength(5)
    })
  })
})
