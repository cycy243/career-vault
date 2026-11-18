<template>
  <div class="input_wrapper" :class="{ true_false: type === 'true_false' }">
      <label :for="name">{{ title }}:</label>
      <div>
        <p>No</p>
        <ToggleSwitch v-model="internalValue" inputId="switch" />
        <p>Yes</p>
      </div>
    <div v-if="error" class="error_wrapper">
      <p>{{ error }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';

export interface FormInputProps<T> {
  error?: string;
  title: string;
  name: string;
  id?: string;
  placeholder?: string;
  defaultValue?: T;
  type: string;
  checked: boolean
}
const props = defineProps<FormInputProps<string | Date | null>>();
watch(
  () => props.checked,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const emit = defineEmits(['update:modelValue', 'blur']);

// Reactive internal value to track the input field's value
const internalValue = ref(props.checked);

// Watch for changes in internalValue and emit the 'update:modelValue' event
watch(internalValue, (newValue: any) => {
  emit('update:modelValue', newValue);
});
</script>
<style lang="css" scoped>
.input_wrapper {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  row-gap: 0.2rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
}

input:not([type='radio']):not([type='checkbox']) {
  width: 100%;
}

input[type='checkbox'] {
  justify-self: start;
}

.error_wrapper {
  grid-column: 2;
  font-size: 0.85rem;
  color: var(--cv-error);
}

.true_false div, .input_wrapper > div {
  display: flex;
  gap: 1rem;
}

@media (max-width: 520px) {
  .input_wrapper {
    grid-template-columns: 1fr;
  }

  .error_wrapper {
    grid-column: 1;
  }
}
</style>
