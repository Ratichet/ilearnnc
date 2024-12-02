<template>
  <div id="app">
    <transition name="fade">
      <router-view />
    </transition>
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
  name: 'App',
  setup() {
    return { router };
  }
};
</script>


<style>
body {
:root {
  --primary-color: #000280;          /* bleu */
  --secondary-color: #0e9714;        /* vert */
  --danger-color: #af0202;           /* Rouge */
  --background-color: #2c003e;       /* Violet foncé */
  --card-background-color: rgba(0, 0, 0, 0.295); /* noir semi-transparent */
  --text-color: #ffffff;                /* Blanc */
  --heading-color: #ffffff;             /* Blanc */
  --border-color: rgba(255, 255, 255, 0.2); /* Bordure légère */
  --hover-color: #990099;            /* Violet plus foncé */
  --primary-hover-color: #010258;    /* bleu plus foncé */
  --secondary-hover-color: #016106;  /* vert plus foncé */
  --danger-hover-color: rgb(97, 11, 11);     /* Rouge plus foncé */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

background: linear-gradient(135deg, #06003e, #033f21, #06003e);
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>