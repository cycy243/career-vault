<template>
  <div class="input_wrapper">
    <label :for="name">{{ title }}:</label>
    <input
      :type="type"
      :name="name"
      :id="id || name"
      :placeholder="placeholder"
      v-model="internalValue"
      @input="$emit('update:modelValue', ($event.target as any)?.value)"
      @blur="$emit('blur')"
    />
    <div v-if="error" class="error_wrapper">
      <p>{{ error }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

interface FormInputProps<T> {
  error?: string
  title: string
  name: string
  id?: string
  placeholder?: string
  defaultValue?: T
  type: string
}
const props = defineProps<FormInputProps<string | Date | null>>()

const emit = defineEmits(['update:modelValue', 'blur'])

// Reactive internal value to track the input field's value
const internalValue = ref(props.defaultValue)

// Watch for changes in internalValue and emit the 'update:modelValue' event
watch(internalValue, (newValue: any) => {
  console.log('internalValue changed: ' + newValue)
  emit('update:modelValue', newValue)
})
</script>
<style lang="css" scoped>
.input_wrapper {
  display: flex;
  flex-direction: row;
}

label {
  width: 8rem;
}

input {
  width: 12rem;
}

.error_wrapper p {
  margin: 0;
  position: absolute;
}
</style>
