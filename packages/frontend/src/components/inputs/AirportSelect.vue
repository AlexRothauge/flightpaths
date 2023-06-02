<template>
  <v-col>
    <h5>Wähle Flughafen:</h5>
    <v-text-field
      data-cy="airport-dropdown"
      v-model="filterState.inputValue"
      @input="handleInput"
      placeholder="Filter Airports with name or icao"
    />
    <div
      class="options-container v-select"
      v-if="showOptions && filteredOptions.length > 0"
      @click="optionsClicked = true"
    >
      <ul :class="{ 'overflow-y-scroll': filteredOptions.length > 4 }">
        <li v-for="airportOption in filteredOptions" :key="airportOption.icao" @click="handleSelect(airportOption)">
          {{ airportOption.name }} - {{ airportOption.icao }}
        </li>
      </ul>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { getAirports as apiGetAirports } from "@/services/flight.service";
import type { Airport, GeoCoordinate } from "@/types/models";
import { computed, onMounted, reactive, ref } from "vue";

const state: {
  airports: Airport[];
} = reactive({
  airports: [],
});

const filterState: {
  inputValue: string;
} = reactive({ inputValue: "" });

const emit = defineEmits<(e: "selectAirport", location: GeoCoordinate) => void>();

const showOptions = ref(false);
const optionsClicked = ref(false);

const filteredOptions = computed(() => {
  const airportsFilter = filterState.inputValue.toLocaleLowerCase();
  if (airportsFilter === "") {
    return state.airports.slice(0, 10);
  }
  const airports: Airport[] = state.airports;

  const airportNames = airports
    .filter((airport) => airport.name.toLocaleLowerCase().includes(airportsFilter))
    .slice(0, 10);
  const airportIcaos = airports
    .filter((airport) => !airportNames.includes(airport))
    .filter((airport) => airport.icao.toLocaleLowerCase().includes(airportsFilter))
    .slice(0, 10);
  return airportNames.concat(airportIcaos);
});

function handleInput(): void {
  showOptions.value = true;
}

function handleSelect(option: Airport): void {
  filterState.inputValue = option.name + " - " + option.icao;
  showOptions.value = false;
  emit("selectAirport", { latitude: option.location.latitude, longitude: option.location.longitude });
}

onMounted(async () => {
  state.airports = await apiGetAirports();
});

onMounted(() => {
  document.addEventListener("click", () => {
    if (!optionsClicked.value) {
      showOptions.value = false;
    }
    optionsClicked.value = false;
  });
});
</script>

<style>
.options-container.v-select {
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  padding: 12px 16px;
  border-radius: 4px;
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e5e5;
  color: #333;
  background-color: #fff;
}

.options-container.v-select ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
  max-height: 200px;
}

.overflow-y-scroll {
  overflow-y: scroll;
}

.options-container.v-select ul li {
  padding: 12px 16px;
  cursor: pointer;
}

.options-container.v-select ul li:hover {
  background-color: #e5e5e5;
}
</style>
