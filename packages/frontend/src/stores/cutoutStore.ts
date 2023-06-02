import type { GeoCoordinate, RadiusCutout, RectangleCutout, Strategy } from "@/types/models";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useRectangleCutoutStore = defineStore("rectangleCutout", () => {
  const cutout = ref<RectangleCutout>({
    discriminator: "rectangle",
    minCoordinate: { longitude: 8.070556, latitude: 49.533333 },
    maxCoordinate: { longitude: 9.070556, latitude: 50.533333 },
  });

  function setMin(m: GeoCoordinate): void {
    cutout.value.minCoordinate = m;
  }

  function setMax(m: GeoCoordinate): void {
    cutout.value.maxCoordinate = m;
  }

  const getMin = computed(() => cutout.value.minCoordinate);
  const getMax = computed(() => cutout.value.maxCoordinate);
  const getCutout = computed(() => cutout.value);

  return {
    cutout,
    setMin,
    setMax,
    getMin,
    getMax,
    getCutout,
  };
});

export const useRadiusCutoutStore = defineStore("radiusCutout", () => {
  const cutout = ref<RadiusCutout>({
    discriminator: "radius",
    radius: 50,
    location: { longitude: 8.570556, latitude: 50.033333 },
  });

  function setRadius(r: number): void {
    cutout.value.radius = r;
  }

  function setLocation(l: GeoCoordinate): void {
    cutout.value.location = l;
  }

  const getRadius = computed(() => cutout.value.radius);
  const getLocation = computed(() => cutout.value.location);
  const getCutout = computed(() => cutout.value);

  return {
    cutout,
    setRadius,
    setLocation,
    getRadius,
    getLocation,
    getCutout,
  };
});

export const useCutoutStore = defineStore("cutout", () => {
  const strategy = ref<Strategy>("ICAO");

  const radius = useRadiusCutoutStore();
  const rectangle = useRectangleCutoutStore();

  function setStrategy(s: Strategy): void {
    strategy.value = s;
  }

  const getStrategy = computed(() => strategy.value);
  const getCutout = computed(() => {
    switch (strategy.value) {
      case "RECTANGLE":
        return rectangle.getCutout;
      case "ICAO":
      case "RADIUS":
      default:
        return radius.getCutout;
    }
  });

  return {
    setStrategy,
    getStrategy,
    getCutout,
  };
});
