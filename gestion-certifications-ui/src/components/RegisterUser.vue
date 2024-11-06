<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="registerUser">
      <label for="username">Username:</label>
      <input type="text" v-model="username" required />
      <label for="password">Password:</label>
      <input type="password" v-model="password" required />
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async registerUser() {
      try {
        await axios.post('http://localhost:3000/auth/register', {
          username: this.username,
          password: this.password
        });
        alert('User registered successfully');
        // Redirection ou autres actions après l'inscription
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
      }
    }
  }
};
</script>
