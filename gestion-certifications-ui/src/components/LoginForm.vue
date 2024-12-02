<template>
  <div class="login">
    <div class="container">
      <h1>Se connecter</h1>
      <form @submit.prevent="login" class="styled-form">
        <div class="form-group">
          <label for="username">Nom d'utilisateur :</label>
          <input type="text" id="username" v-model="username" required class="input-field">
        </div>
        <div class="form-group">
          <label for="password">Mot de passe :</label>
          <input type="password" id="password" v-model="password" required class="input-field">
        </div>
        <button type="submit" class="btn primary">Se connecter</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
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
	async login() {
    try{
    const response = await axios.post('http://localhost:3000/login', {
		username: this.username,
		password: this.password
	}); 
    if (response.data.code === 'USER_DESACTIVATED' && response.data.user.role === 'admin') {
        // Rediriger vers la page de renouvellement
        this.$router.push('/renew-subscription');
        return;
    } else if (response.data.code === 'USER_DESACTIVATED' && response.data.user.role === 'manager') {
        // Rediriger vers la page de compte désactivé
        this.$router.push('/desactivated');
        return;
    }
		localStorage.setItem('token', response.data.accessToken);
		localStorage.setItem('userId', response.data.user.id);
		localStorage.setItem('userRole', response.data.user.role); // Enregistrer le rôle
		if (response.data.user.role === 'admin') {
            this.$router.push('/admin'); // Redirection après connexion réussie
        } else if (response.data.user.role === 'manager') {
            this.$router.push('/manager'); // Redirection après connexion réussie
        } else if (response.data.user.role === 'superadmin') {
            this.$router.push('/superadmin'); // Redirection après connexion réussie
        } else {
            this.errorMessage = 'Rôle inconnu. Veuillez contacter l\'administrateur.';
        }
	}
    catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
    }
  }
}
};
</script>


<style scoped>
/* Réinitialisation des styles par défaut du navigateur */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* Dégradé avec des teintes de violet sombre */
  background: linear-gradient(135deg, #06003e, #033f21, #06003e);
  color: #ffffff;
}

.container {
  margin-bottom: 15%;
  background-color: rgba(0, 0, 0, 0.5); /* Fond semi-transparent */
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #ffffff;
}

.styled-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 1em;
  color: #ffffff;
}

.input-field {
  padding: 10px;
  border: 1px solid #056b16; /* Bordure avec teinte violette */
  border-radius: 5px;
  width: 100%;
  font-size: 1em;
  background-color: rgba(255, 255, 255, 0.1); /* Fond semi-transparent */
  color: #ffffff;
}

.input-field::placeholder {
  color: #cccccc;
}

.input-field:focus {
  outline: none;
  border-color: #016617; /* Couleur de la bordure au focus */
}

.btn {
  padding: 10px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
}

.btn.primary {
  background-color: #000280; /* Bouton avec teinte violette */
  color: #ffffff;
}

.btn.primary:hover {
  background-color: #010258; /* Couleur du bouton au survol */
}

.error-message {
  color: #ff4d4d;
  margin-top: 15px;
}
/* Styles pour les champs de saisie auto-complétés */
input.input-field:-webkit-autofill,
input.input-field:-webkit-autofill:hover,
input.input-field:-webkit-autofill:focus,
input.input-field:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.1) inset;
  -webkit-text-fill-color: #ffffff;
  transition: background-color 5000s ease-in-out 0s;
}
</style>