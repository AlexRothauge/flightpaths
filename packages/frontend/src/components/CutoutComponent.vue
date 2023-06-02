<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-select
          data-cy="strategy-dropdown"
          v-model="getStrategy"
          label="strategy"
          :items="strategies"
          @update:modelValue="handleSelect"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="getStrategy === 'ICAO'">
        <ICAOCutout @airportSelectStatus="handleAirportSelected" />
      </v-col>
      <v-col v-if="getStrategy === 'RADIUS'">
        <RadiusCutout />
      </v-col>
      <v-row v-if="getStrategy === 'RECTANGLE'">
        <RectangleCutout />
      </v-row>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import ICAOCutout from "@/components/ICAOCutout.vue";
import RadiusCutout from "@/components/RadiusCutout.vue";
import RectangleCutout from "@/components/RectangleCutout.vue";
import { useCutoutStore } from "@/stores/cutoutStore";
import { strategies, type Strategy } from "@/types/models";
import { storeToRefs } from "pinia";

const cutoutStore = useCutoutStore();
const emit = defineEmits<{
  (e: "changeStrategy", strategy: Strategy): void;
  (e: "airportSelectStatus", selected: boolean): void;
}>();
const { getStrategy } = storeToRefs(cutoutStore);

function handleSelect(s: Strategy): void {
  cutoutStore.setStrategy(s);
  emit("changeStrategy", s);
}

function handleAirportSelected(value: boolean): void {
  emit("airportSelectStatus", value);
}
</script>
