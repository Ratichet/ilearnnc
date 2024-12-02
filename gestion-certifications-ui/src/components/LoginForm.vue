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
    try {
      const response = await this.authenticateUser();
      this.handleLoginResponse(response);
    } catch (error) {
      this.handleLoginError(error);
    }
  },
  async authenticateUser() {
    return await axios.post(`${process.env.VUE_APP_API_BASE_URL}/login`, {
      username: this.username,
      password: this.password
    });
  },
  handleLoginResponse(response) {
    if (response.data.code === 'USER_DESACTIVATED') {
      this.handleUserDeactivated(response.data.user.role);
      return;
    }
    this.storeUserData(response.data);
    this.redirectUser(response.data.user.role);
  },
  handleUserDeactivated(role) {
    if (role === 'admin') {
      this.$router.push('/renew-subscription');
    } else if (role === 'manager') {
      this.$router.push('/desactivated');
    }
  },
  storeUserData(data) {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userRole', data.user.role);
  },
  redirectUser(role) {
    if (role === 'admin') {
      this.$router.push('/admin');
    } else if (role === 'manager') {
      this.$router.push('/manager');
    } else if (role === 'superadmin') {
      this.$router.push('/superadmin');
    } else {
      this.errorMessage = 'Rôle inconnu. Veuillez contacter l\'administrateur.';
    }
  },
  handleLoginError(error) {
    console.error('Login error:', error);
    this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
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