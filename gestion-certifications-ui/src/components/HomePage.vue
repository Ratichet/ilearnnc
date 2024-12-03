<template>
  <div class="home">
    <div class="container">
      <h1>Bienvenue sur [système de gestion des certifications]</h1>
      <p>Gérez vos certifications de manière efficace et efficiente.</p>
      <div class="button-group">
        <router-link to="/login">
          <button class="btn primary">Se connecter</button>
        </router-link>
        <router-link to="/register">
          <button class="btn secondary">Register</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset default browser styles */

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #06003e, #033f21, #06003e);
  color: #fff;
}

.container {
  margin-bottom: 15%;
  text-align: center;
  background-color: var(--card-background-color);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

h1, p {
  margin: 0;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn.primary {
  background-color: var(--primary-color);
  color: #fff;
}

.btn.primary:hover {
  background-color:var(--primary-hover-color);
}

.btn.secondary {
  background-color: var(--secondary-color);
  color: #fff;
}

.btn.secondary:hover {
  background-color: var(--secondary-hover-color);
}
</style>