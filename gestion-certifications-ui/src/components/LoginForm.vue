<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  setup() {
    const router = useRouter();

    return { router };
},
methods: {
	login() {
    axios.post('http://localhost:3000/login', {
		username: this.username,
		password: this.password
	})
	.then(response => {
		localStorage.setItem('token', response.data.accessToken);
		localStorage.setItem('userId', response.data.user.id);
		localStorage.setItem('userRole', response.data.user.role); // Enregistrer le rôle
		this.$router.push('/admin'); // Redirection après connexion réussie
	})
	.catch(error => {
		console.error('Login error:', error);
	});
	}
}
};
</script>