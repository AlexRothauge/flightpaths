import AppVue from "@/App.vue";
import type { Component } from "vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Vue",
      component: AppVue as Component,
    },
  ],
});

export default router;
