<template>
 <div class = home>
    <h1>Welcome to the Certification Management System</h1>
    <div>
      <router-link to="/login">
        <button>Login</button>
      </router-link>
      <router-link to="/register">
        <button>Register</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 20px;
}
button {
  margin: 10px;
  padding: 10px;
  background-color: blue;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
