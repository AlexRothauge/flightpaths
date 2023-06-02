<template>
  <v-col>
    <h5>{{ props.label }}</h5>
    <v-text-field
      data-cy="textfield-lon"
      @input="emit('update', state.coordinate)"
      v-model.number="state.coordinate.longitude"
      :rules="lonValidation"
      type="number"
      :label="longitudeLabel"
      hide-details="auto"
    />
    <v-text-field
      data-cy="textfield-lat"
      @input="emit('update', state.coordinate)"
      v-model.number="state.coordinate.latitude"
      :rules="latValidation"
      type="number"
      :label="latitudeLabel"
      hide-details="auto"
    />
  </v-col>
</template>

<script setup lang="ts">
import { latValidation, lonValidation } from "@/rules/rules";
import type { GeoCoordinate } from "@/types/models";
import { computed, onBeforeUpdate, onMounted, reactive } from "vue";

const props = defineProps<{
  label: string;
  coordinate?: GeoCoordinate;
}>();

const defaultCoordinate = {
  latitude: 0,
  longitude: 0,
};
const state: {
  coordinate: GeoCoordinate;
} = reactive({
  coordinate: defaultCoordinate,
});

const longitudeLabel = computed(() => `${props.label} Longitude`);
const latitudeLabel = computed(() => `${props.label} Latitude`);

const emit = defineEmits<(e: "update", c: GeoCoordinate) => void>();

onBeforeUpdate(() => {
  state.coordinate = props.coordinate ?? defaultCoordinate;
});

onMounted(() => {
  state.coordinate = props.coordinate ?? defaultCoordinate;
  emit("update", state.coordinate);
});
</script>
