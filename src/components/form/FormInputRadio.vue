<template>
  <div class="input_wrapper">
    <label>
      <input
        type="radio"
        :name="name"
        :value="inputValue"
        v-model="internalValue"
        :checked="isChecked()"
        @change="emitNewValue()"
      />
      {{ title }}
    </label>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

interface FormInputProps<T> {
  title: string
  name: string
  id?: string
  value: string | undefined
  inputValue: string
  defaultValue?: T
}
const props = defineProps<FormInputProps<string | Date | null>>()
watch(
  () => props.defaultValue,
  (newValue) => {
    internalValue.value = newValue
  }
)

const emit = defineEmits(['update:value'])

// Reactive internal value to track the input field's value
const internalValue = ref(props.defaultValue)

// Watch for changes in internalValue and emit the 'update:value' event
watch(internalValue, () => {
  emitNewValue()
})

const isChecked = () => {
  return props.value === props.inputValue
}

const emitNewValue = () => {
  emit('update:value', props.inputValue)
}
</script>
<style lang="css" scoped>
.input_wrapper {
  width: 20rem;
  display: flex;
  flex-wrap: wrap;
}

input {
  width: 12rem;
}

input[type='radio'] {
  width: initial;
}

.error_wrapper {
  width: 100%;
}

.true_false div {
  display: flex;
  flex-direction: column;
}
</style>
