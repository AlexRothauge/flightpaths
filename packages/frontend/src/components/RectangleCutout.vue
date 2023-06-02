<template>
  <v-col>
    <CoordinateInput :coordinate="getMin" label="Min" @update="handleMin" />
    <CoordinateInput :coordinate="getMax" label="Max" @update="handleMax" />
  </v-col>
</template>

<script setup lang="ts">
import CoordinateInput from "@/components/inputs/CoordinateInput.vue";
import { useRectangleCutoutStore } from "@/stores/cutoutStore";
import type { GeoCoordinate } from "@/types/models";
import { storeToRefs } from "pinia";

const cutoutStore = useRectangleCutoutStore();
const { getMax, getMin } = storeToRefs(cutoutStore);

const handleMin = (c: GeoCoordinate): void => {
  cutoutStore.setMin(c);
};
const handleMax = (c: GeoCoordinate): void => {
  cutoutStore.setMax(c);
};
</script>
