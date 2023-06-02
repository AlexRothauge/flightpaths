<template>
  <CoordinateInput :coordinate="getLocation" label="Airport Coordinate" @update="handleCoordinate" />
  <RadiusInput :modelValue="getRadius" @update:modelValue="(r: number) => cutoutStore.setRadius(r)" />
</template>

<script setup lang="ts">
import CoordinateInput from "@/components/inputs/CoordinateInput.vue";
import RadiusInput from "@/components/inputs/RadiusInput.vue";
import { useRadiusCutoutStore } from "@/stores/cutoutStore";
import type { GeoCoordinate } from "@/types/models";
import { storeToRefs } from "pinia";

const cutoutStore = useRadiusCutoutStore();
const { getRadius, getLocation } = storeToRefs(cutoutStore);

const handleCoordinate = (c: GeoCoordinate): void => {
  cutoutStore.setLocation(c);
};
</script>
