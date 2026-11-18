<template>
  <div class="input_wrapper" :class="{ true_false: type === 'true_false' }">
    <template v-if="type === 'true_false'">
      <label :for="name">{{ title }}:</label>
      <div>
        <label>
          <input
            type="radio"
            :name="name"
            :id="(id || name) + '_true'"
            :placeholder="placeholder"
            :value="true"
            v-model="internalValue"
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            :value="false"
            :name="name"
            :id="(id || name) + '_false'"
            :placeholder="placeholder"
            v-model="internalValue"
          />
          No
        </label>
      </div>
    </template>
    <template v-else>
      <label :for="name">{{ title }}:</label>
      <input
        :type="type"
        :name="name"
        :id="id || name"
        :placeholder="placeholder"
        v-model="internalValue"
        @input="$emit('update:modelValue', internalValue)"
        @blur="$emit('blur')"
      />
    </template>
    <div v-if="error" class="error_wrapper">
      <p>{{ error }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

export interface FormInputProps<T> {
  error?: string;
  title: string;
  name: string;
  id?: string;
  placeholder?: string;
  defaultValue?: T;
  type: string;
}
const props = defineProps<FormInputProps<string | Date | null>>();
watch(
  () => props.defaultValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const emit = defineEmits(['update:modelValue', 'blur']);

// Reactive internal value to track the input field's value
const internalValue = ref(props.defaultValue);

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

.true_false div {
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
