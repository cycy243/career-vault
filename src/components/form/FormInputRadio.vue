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
import { ref, watch } from 'vue';

interface FormInputProps<T> {
  title: string;
  name: string;
  id?: string;
  value: string | undefined;
  inputValue: string;
  defaultValue?: T;
}
const props = defineProps<FormInputProps<string | Date | null>>();
watch(
  () => props.defaultValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const emit = defineEmits(['update:value']);

// Reactive internal value to track the input field's value
const internalValue = ref(props.defaultValue);

// Watch for changes in internalValue and emit the 'update:value' event
watch(internalValue, () => {
  emitNewValue();
});

const isChecked = () => {
  return props.value === props.inputValue;
};

const emitNewValue = () => {
  emit('update:value', props.inputValue);
};
</script>
<style lang="css" scoped>
label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--cv-border);
  border-radius: 999px;
  background: var(--cv-surface-strong);
  cursor: pointer;
  transition:
    border-color var(--cv-fast) var(--cv-ease),
    background-color var(--cv-fast) var(--cv-ease);
}

label:hover {
  border-color: var(--cv-steel);
}

label:has(input:checked) {
  border-color: var(--cv-steel);
  background: var(--cv-steel-tint);
  font-weight: 500;
}
</style>
