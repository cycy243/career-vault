<template>
  <div>
    <label :for="inputName">{{ inputLabel }}</label>
    <VField :name="inputName" :id="inputName" as="select" v-model="value" @change="valueChanged">
      <option value="none" selected>No options selected</option>
      <option v-for="option in options" :key="option.name" :value="option.name">
        {{ option.value }}
      </option>
    </VField>
  </div>
</template>
<script lang="ts">
import { Field } from 'vee-validate';
import { defineComponent, type Component, type DefineComponent, type PropType } from 'vue';

export interface Option {
  name: string;
  value: string;
}

export default defineComponent({
  emits: ['update:modelValue', 'blur'],
  components: {
    VField: Field
  },
  props: {
    inputName: {
      type: Object as PropType<string>,
      required: true
    },
    inputLabel: {
      type: Object as PropType<string>,
      required: true
    },
    options: {
      type: Object as PropType<Array<Option>>,
      required: true
    },
    modelValue: String
  },
  data() {
    return {
      value: ''
    };
  },
  methods: {
    valueChanged(event: any) {
      this.$emit('update:modelValue', event.target.value);
    }
  },
  watch: {
    modelValue: {
      handler(newVal: String) {
        this.value = newVal.toString();
      },
      immediate: true
    }
  }
});
</script>
