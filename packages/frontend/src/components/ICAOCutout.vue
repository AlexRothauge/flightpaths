<template>
  <v-col>
    <AirportSelect @selectAirport="handleSelectAirport" @clearFilter="hideRadiusCutout" />
    <RadiusCutoutComponent v-if="showRadiusCutout" />
  </v-col>
</template>

<script setup lang="ts">
import AirportSelect from "@/components/inputs/AirportSelect.vue";
import RadiusCutoutComponent from "@/components/RadiusCutout.vue";
import { useRadiusCutoutStore } from "@/stores/cutoutStore";
import type { GeoCoordinate } from "@/types/models";
import { ref } from "vue";

const cutoutStore = useRadiusCutoutStore();
const emit = defineEmits<(e: "airportSelectStatus", selected: boolean) => void>();

const showRadiusCutout = ref(false);

function hideRadiusCutout(): void {
  showRadiusCutout.value = false;
  emit("airportSelectStatus", false);
}

function handleSelectAirport(location: GeoCoordinate): void {
  cutoutStore.setLocation(location);
  showRadiusCutout.value = true;
  emit("airportSelectStatus", true);
}
</script>
