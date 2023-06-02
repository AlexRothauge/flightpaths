import App from "@/App.vue";
import router from "@/router";
import type { Component } from "vue";
import { createApp } from "vue";

import "@mdi/font/css/materialdesignicons.css";
import "@vuepic/vue-datepicker/dist/main.css";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import "vuetify/styles";

const vuetify = createVuetify();

const app = createApp(App as Component);
const pinia = createPinia();

app.use(router);

app.use(vuetify);
app.use(pinia);

app.mount("#app");
