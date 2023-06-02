<template>
  <v-app>
    <v-app-bar color="light-blue" :elevation="2">
      <v-app-bar-title>Flugwege</v-app-bar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-carousel v-if="imageState.allImageURLs.length > 0" hide-delimiters show-arrows="hover" height="600px">
        <v-carousel-item
          v-for="imageId in imageState.allImageURLs"
          :key="imageId"
          :src="`/api/images/generated/${imageId}`"
          cover
        />
      </v-carousel>
      <v-card elevation="5" class="mt-15 mx-auto" width="800">
        <v-form ref="formRef" v-model="validationState.valid">
          <v-container fluid>
            <v-row>
              <v-col>
                <h3 class="mt-2 mx-auto">Konfiguration der Bildgenerierung:</h3>
                <CutoutComponent @airportSelectStatus="handleAirportSelected" @changeStrategy="handleChangeStrategy" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h5>Projektion:</h5>
                <v-select
                  data-cy="projection-dropdown"
                  v-model="flightDataState.flightData.projection"
                  :items="projectionsState.projections"
                  label="Projektion"
                />
              </v-col>
            </v-row>
            <ColorSelection
              :colors="flightDataState.flightData.schema"
              :enable-switch="enableMapboxSwitch"
              @colorSchema="handleColorSchemaChange"
            />
            <v-row>
              <v-col>
                <h5>Auflösung:</h5>
                <v-text-field
                  data-cy="resolution-input"
                  :rules="numberRule"
                  v-model="flightDataState.flightData.resolution"
                  label="Auflösung"
                  :suffix="resolutionSuffix"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h5>Von:</h5>
                <Datepicker
                  data-cy="from-datepicker"
                  v-model="flightDataState.flightData.timespan.from"
                  :maxDate="flightDataState.flightData.timespan.until"
                />
              </v-col>
              <v-col>
                <h5>Bis:</h5>
                <Datepicker
                  data-cy="until-datepicker"
                  v-model="flightDataState.flightData.timespan.until"
                  :minDate="flightDataState.flightData.timespan.from"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col />
              <v-col />
              <v-col>
                <v-btn
                  data-cy="generateimage-button"
                  v-on:click="generateImage"
                  :disabled="!validationState.valid || validationState.disableButton"
                >
                  Bild generieren
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card>
      <v-card elevation="5" class="mt-15 mx-auto" width="800">
        <h3>Ergebnis:</h3>
        <v-img v-if="imageState.imageURL" data-cy="flightpath-image" :src="imageState.imageURL" />
        <LoadingSymbol
          v-if="imageState.imageId && !imageState.imageURL"
          :imageId="imageState.imageId"
          initialStatus="CREATING"
          @imageCreated="handleImageStatusChange"
        />
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {
  generateImage as apiGenerateImage,
  getAllImagePaths,
  getFormattedFlightData,
  getProjections,
} from "@/services/flight.service";
import Datepicker from "@vuepic/vue-datepicker";
import { computed, onMounted, reactive, ref } from "vue";
import { VForm } from "vuetify/components";

import ColorSelection from "@/components/ColorSelection.vue";
import CutoutComponent from "@/components/CutoutComponent.vue";
import LoadingSymbol from "@/components/LoadingSymbol.vue";
import { numberRule } from "@/rules/rules";
import { useCutoutStore } from "@/stores/cutoutStore";
import type { ColorSchema, FlightData, MapboxSchema, Strategy, Timespan } from "@/types/models";

const defaultTimespan = (): Timespan => {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
  yesterdayMidnight.setFullYear(2021);

  return {
    from: yesterdayMidnight,
    until: todayMidnight,
  };
};

const resolutionSuffix = "px";

const cutoutStore = useCutoutStore();
const formRef = ref<VForm | null>(null);

const validationState: {
  valid: boolean;
  airportSelected: boolean;
  selectedStrategy: string;
  disableButton: boolean;
} = reactive({
  valid: false,
  airportSelected: false,
  selectedStrategy: "ICAO",
  disableButton: false,
});

const flightDataState: {
  flightData: FlightData;
} = reactive({
  flightData: {
    schema: {
      foreground: "#000000",
      background: "#FFFFFF",
      useMapbox: false,
      mapboxStyle: "dark-v11",
    },
    cutout: {
      discriminator: "radius",
      radius: 0,
      location: {
        latitude: 0,
        longitude: 0,
      },
    },
    projection: "MERCATOR",
    resolution: 1000,
    timespan: defaultTimespan(),
  },
});

const projectionsState: {
  projections: string[];
} = reactive({
  projections: [],
});

const imageState: {
  imageId: string;
  imageURL: string;
  allImageURLs: string[];
} = reactive({
  imageURL: "",
  imageId: "",
  allImageURLs: [],
});

async function validateForm(): Promise<void> {
  validationState.disableButton = false;

  if (!formRef.value) {
    return;
  }

  const isICAOStrategySelected = validationState.selectedStrategy === "ICAO";
  const isAirportSelected = validationState.airportSelected;

  if (!isICAOStrategySelected || isAirportSelected) {
    validationState.valid = (await formRef.value.validate()).valid;
  } else {
    validationState.valid = false;
    validationState.disableButton = true;
  }
}

async function handleChangeStrategy(strategy: Strategy): Promise<void> {
  validationState.selectedStrategy = strategy;
  validationState.airportSelected = false;
  await validateForm();
}

onMounted(async () => {
  projectionsState.projections = await getProjections();
  imageState.allImageURLs = await getAllImagePaths();
});

async function handleAirportSelected(status: boolean): Promise<void> {
  validationState.airportSelected = status;
  await validateForm();
}

function handleImageStatusChange(imageStatus: string): void {
  if (imageStatus === "CREATED") {
    imageState.imageURL = `/api/images/generated/flightpath_${imageState.imageId}.png`;
    imageState.allImageURLs.unshift(`flightpath_${imageState.imageId}.png`);
  }
}

function resetImage(): void {
  imageState.imageURL = "";
  imageState.imageId = "";
}

const enableMapboxSwitch = computed(() => {
  return flightDataState.flightData.projection === "MERCATOR";
});

const handleColorSchemaChange = (colorSchema: ColorSchema | MapboxSchema): void => {
  flightDataState.flightData.schema = colorSchema;
  console.log(flightDataState.flightData.schema);
};

async function generateImage(): Promise<void> {
  resetImage();
  flightDataState.flightData.cutout = cutoutStore.getCutout;
  const formattedFlightData = getFormattedFlightData(flightDataState.flightData);
  imageState.imageId = await apiGenerateImage(formattedFlightData);
}
</script>
