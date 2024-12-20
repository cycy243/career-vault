<template>
  <div>
    <label>{{ label }}</label>
    <FormInputRadio
      v-for="(option, index) in options"
      :key="index"
      v-model:value="internalValue"
      :title="option.value"
      :name="input_name"
      :input-value="option.inputValue"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import FormInputRadio from './FormInputRadio.vue'

export type FormGroupInputRadioOptions = {
  value: string
  id?: string
  inputValue: string
}

const props = defineProps<{
  options: Array<FormGroupInputRadioOptions>
  error?: string
  label: string
  input_name: string
  input_id?: string
  value: string | undefined
}>()

const internalValue = ref<string | undefined>(props.value)

const emit = defineEmits(['update:value', 'blur'])

watch(internalValue, (newValue: any) => {
  emit('update:value', newValue)
})

watch(
  () => props.value,
  (newValue) => {
    internalValue.value = newValue
  }
)
</script>
<style lang=""></style>
