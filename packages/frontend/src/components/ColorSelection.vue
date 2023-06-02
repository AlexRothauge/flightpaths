<template>
  <v-row>
    <v-col v-if="props.enableSwitch">
      <h5>Hintergrund</h5>
      <v-switch
        data-cy="mapbox-or-bcolor"
        :label="switchLabel"
        v-model="colors.useMapbox"
        @update:modelValue="resetBackgroundColor"
      />
    </v-col>
    <v-col>
      <h5>Fluglinien Farbe in HEX:</h5>
      <ColorPicker data-cy="foreground-picker" :defaultColor="colors.foreground" @changeColor="setForeground" />
      <template v-if="!colors.useMapbox">
        <h5>Hintergrundfarbe in HEX:</h5>
        <ColorPicker data-cy="background-picker" :defaultColor="colors.background" @changeColor="setBackground" />
      </template>
      <template v-if="props.enableSwitch && colors.useMapbox">
        <h5>Mapbox Style</h5>
        <v-text-field :modelValue="colors.mapboxStyle" @update:modelValue="setMapboxStyle" />
      </template>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { ColorSchema, MapboxSchema } from "@/types/models";
import { computed, ref } from "vue";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps<{
  enableSwitch: boolean;
  colors: ColorSchema | MapboxSchema;
}>();

const colors = ref(props.colors);

const switchLabel = computed(() => {
  return colors.value.useMapbox ? "Mapbox" : "Farbe";
});

const emit = defineEmits<(e: "colorSchema", colors: ColorSchema | MapboxSchema) => void>();

const setForeground = (color: string): void => {
  colors.value.foreground = color;
  emit("colorSchema", colors.value);
};

const setBackground = (color: string): void => {
  if (colors.value.useMapbox) {
    return;
  }
  colors.value.background = color;
  emit("colorSchema", colors.value);
};

const setMapboxStyle = (style: string): void => {
  if (!colors.value.useMapbox) {
    return;
  }
  colors.value.mapboxStyle = style;
  emit("colorSchema", colors.value);
};

const resetBackgroundColor = (): void => {
  emit("colorSchema", colors.value);
};
</script>
