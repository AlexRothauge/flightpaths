<template>
  <v-progress-circular color="primary" indeterminate />
</template>

<script lang="ts" setup>
import { getImageStatus } from "@/services/flight.service";
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  imageId: { type: String, required: true },
});
const emit = defineEmits<(e: "imageCreated", status: string) => void>();

const isMounted = ref(false);
const timeoutId = ref<number | undefined>(undefined);

function startPolling(imageId: string): void {
  async function poll(): Promise<void> {
    const status = await getImageStatus(imageId);
    if (isMounted.value) {
      if (status === "CREATING") {
        timeoutId.value = setTimeout(poll, 1500);
      } else {
        emit("imageCreated", status);
      }
    }
  }

  void poll();
}

onMounted(() => {
  isMounted.value = true;
  startPolling(props.imageId);
});

onUnmounted(() => {
  isMounted.value = false;
  clearTimeout(timeoutId.value);
});
</script>
