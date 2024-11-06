<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { createRouter, createWebHistory } from 'vue-router';


const routes = [
  { path: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default {
  setup() {
    return { router };
  }
};
</script>
