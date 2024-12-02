<template>
  <div class="page">
    <h2>Ajouter un utilisateur</h2>
    <form @submit.prevent="createUser">
      <div class="form-group">
        <div>
            <label>Nom d'utilisateur : </label>
            <input v-model="username" required type="text"/>
        </div>
        <div>
            <label>Mot de passe : </label>
            <input type="password" v-model="password" required />
        </div>
        <div>
            <label>Confirmer le mot de passe : </label>
            <input type="password" v-model="confirmPassword" required />
        </div>
        <div>
            <label>E-Mail : </label>
            <input v-model="email" type="email" required />
        </div>
        </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button type="submit">Créer</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      errorMessage: ''
    };
  },
  methods: {
    createUser() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        return;
      }

      axios.post('http://localhost:3000/register', {
        username: this.username,
        password: this.password,
        email: this.email,
        role: 'manager' // Adjust the role as needed
      })
        .then(() => {
          this.username = '';
          this.password = '';
          this.confirmPassword = '';
          this.email = '';
          this.errorMessage = '';
          alert('Utilisateur créé avec succès');
        })
        .catch(error => {
          console.error('Error creating user:', error);
          this.errorMessage = 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer plus tard.';
        });
    }
  }
};
</script>
<style scoped>
.page {
  max-width: 600px;
  margin: 50px auto; /* Centrer verticalement et horizontalement */
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 16px; /* Arrondir les bords de la boîte principale */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Légèrement plus prononcé pour mieux se démarquer */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrer le contenu horizontalement */
}

h2 {
  color: var(--heading-color);
  margin-bottom: 20px;
  text-align: center; /* Centrer le texte du titre */
}

.form-group {
  margin-bottom: 20px;
  width: 100%; /* Utiliser toute la largeur disponible */
  display: flex;
  flex-direction: column; /* Empiler le label et l'input verticalement */
  align-items: flex-start; /* Assurer un bon alignement du texte */
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  display: block; /* S'assurer que le label est en haut de l'input */
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"] {
  width: calc(100% - 24px); /* Adapter la largeur pour garder de l'espace autour */
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px; /* Arrondir davantage les coins */
  font-size: 1em;
  background-color: var(--input-background-color);
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus,
.form-group input[type="email"]:focus {
  border-color: var(--primary-color);
  outline: none;
}

button {
  display: block;
  padding: 12px 25px;
  margin: 20px auto;
  margin-top: 20px; /* Espacement entre les champs et le bouton */
  border: none;
  border-radius: 8px; /* Arrondir les boutons */
  background: var(--primary-color);
  color: var(--background-color);
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.3s, transform 0.1s;
  align-self: center; /* Centrer le bouton */
}

button:hover {
  background: var(--primary-hover-color);
}

button:active {
  transform: scale(0.98);
}

.error-message {
  color: var(--error-color);
  margin-top: 20px;
  font-weight: bold;
  text-align: center;
}
</style>
