<template>
  <div class = page>
    <h2>Ajouter un utilisateur</h2>
    <form @submit.prevent="createUser">
      <div>
        <label>Nom d'utilisateur</label>
        <input v-model="username" required />
      </div>
      <div>
        <label>Mot de passe</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label>Rôle</label>
        <select v-model="role">
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employe">Employé</option>
        </select>
      </div>
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
      role: 'manager'
    };
  },
  methods: {
    createUser() {
      axios.post('http://localhost:3000/register', {
        username: this.username,
        password: this.password,
        role: this.role
      })
      .then(response => {
		alert(`Utilisateur créé avec succès : ${response.data.username}`)
        this.username = '';
        this.password = '';
        this.role = 'manager';
		this.$router.push('/');
      })
      .catch(error => {
		alert(`Cet utilisateur est déjà dans la base de donnée, veuillez vous connecter`)
		this.$router.push('/login');
        console.error('Erreur lors de la création de l\'utilisateur:', error);
      });
    }
  }
};
</script>
<style scoped>
.page {
  text-align: center;
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

