<template>
  <v-col>
    <h5>Radius:</h5>
    <v-text-field
      data-cy="radius-input"
      v-model.number="radius"
      :rules="numberRule"
      type="number"
      label="Radius in km"
      hide-details="auto"
    />
  </v-col>
</template>

<script setup lang="ts">
import { numberRule } from "@/rules/rules";
import { computed, defineEmits } from "vue";

const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<(e: "update:modelValue", radius: number) => void>();

const radius = computed({
  get: () => props.modelValue,
  set: (r: number) => emit("update:modelValue", r),
});
</script>
