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
        @input="$emit('update:modelValue', ($event.target as any)?.value)"
        @blur="$emit('blur')"
      />
    </template>
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
watch(
  () => props.defaultValue,
  (newValue) => {
    internalValue.value = newValue
  }
)

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
  width: 20rem;
  display: flex;
  flex-wrap: wrap;
}

label {
  width: 8rem;
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
