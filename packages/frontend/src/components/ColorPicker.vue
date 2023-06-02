<template>
  <v-text-field v-model="color" class="ma-0 pa-0" hide-details solo @input="returnColorPick">
    <template #append>
      <v-menu v-model="menu" :close-on-content-click="false" nudge-bottom="105" nudge-left="16" top>
        <template #activator="{ props }">
          <v-btn :style="swatchStyle" v-bind="props" @focusout="returnColorPick" />
        </template>
        <v-card>
          <v-card-text class="pa-0">
            <v-color-picker v-model="color" />
          </v-card-text>
        </v-card>
      </v-menu>
    </template>
  </v-text-field>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

const props = defineProps({
  defaultColor: { type: String, required: true },
});
const color = ref(props.defaultColor);

const emit = defineEmits<(e: "changeColor", color: string) => void>();

const menu = ref(false);
const swatchStyle = computed(() => {
  return {
    backgroundColor: color.value,
    cursor: "pointer",
    height: "30px",
    width: "30px",
    borderRadius: menu.value ? "50%" : "4px",
    transition: "border-radius 200ms ease-in-out",
  };
});

function returnColorPick(): void {
  emit("changeColor", color.value);
}
</script>
