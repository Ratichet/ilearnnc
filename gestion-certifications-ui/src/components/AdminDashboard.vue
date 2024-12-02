<template>
  <div class="admin-manager">
    <!-- Logout Button -->
    <button @click="logout" class="logout-btn">Logout</button>

    <h1>Admin Dashboard</h1>
    <button @click="toggleAddManagerForm" class="btn primary">
    {{ showAddManagerForm ? 'Annuler' : 'Ajouter un Manager' }}
    </button>
    <!-- Add Manager Form -->
    <!-- Formulaire d'ajout de Manager -->
    <div class="form-section" v-if="showAddManagerForm">
    <h2>Ajouter un Manager</h2>
    <form @submit.prevent="addManager" class="form">
        <!-- Vos champs du formulaire -->
        <div class="form-group">
        <label for="managerUsername">Nom d'utilisateur : </label>
        <input v-model="newManager.username" id="managerUsername" type="text" required />
        </div>
        <div class="form-group">
        <label for="managerEmail">Email : </label>
        <input v-model="newManager.email" id="managerEmail" type="email" required />
        </div>
        <div class="form-group">
        <label for="managerPassword">Mot de passe : </label>
        <input v-model="newManager.password" id="managerPassword" type="password" required />
        </div>
        <div class="form-group">
        <label for="confirmPassword">Confirmer le mot de passe : </label>
        <input v-model="confirmPassword" id="confirmPassword" type="password" required />
        </div>
        <!-- Message d'erreur -->
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        <button type="submit" class="btn primary">Ajouter un Manager</button>
    </form>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="showEditForm" class="form-section">
      <h2>Modifier le Manager</h2>
        <form @submit.prevent="updateManager" class="form">
          <div class="form-group">
            <label for="editUsername">Nom d'utilisateur :</label>
            <input v-model="selectedManager.username" id="editUsername" type="text" required />
          </div>
          <div class="form-group">
            <label for="editEmail">Email :</label>
            <input v-model="selectedManager.email" id="editEmail" type="email" required />
          </div>
          <div class="form-group">
            <label for="editPassword">Nouveau mot de passe :</label>
            <input v-model="selectedManager.password" id="editPassword" type="password" />
          </div>
          <div class="form-group">
            <label for="confirmEditPassword">Confirmer le mot de passe :</label>
            <input v-model="confirmEditPassword" id="confirmEditPassword" type="password" />
          </div>
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        <button type="submit" class="btn">Enregistrer</button>
        <button type="button" @click="cancelEdit" class="btn ">Annuler</button>
    </form>
</div>
    <!-- Managers List -->
    <div class="managers-section" v-if="managers.length">
      <h2>Managers</h2>
      <ul class="manager-list">
        <li v-for="manager in managers" :key="manager.id" class="manager-item">
          <span>{{ manager.username }} - {{ manager.email }} - Role: {{ manager.role }}</span>
          <div class="manager-actions">
            <button @click="openEditForm(manager)" class="btn">Modifier</button>
          </div>
        </li>
      </ul>
    </div>
    <!-- Edit Manager Form -->
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      newManager: {
        username: '',
        password: '',
        email: ''
      },
      confirmPassword: '', // Champ pour confirmer le mot de passe
      managers: [],
      showEditForm: false,
      selectedManager: null,
      confirmEditPassword: '', // Champ pour confirmer le mot de passe lors de l'édition
      errorMessage: '',
      passwordError: '', // Message d'erreur pour les mots de passe\
      showAddManagerForm: false
  };
},
  setup() {
    const router = useRouter();
    return { router };
  },
  mounted() {
    this.fetchManagers();
  },
  methods: {
    async addManager() {
      if (this.newManager.password !== this.confirmPassword) {
        this.passwordError = 'Les mots de passe ne correspondent pas.';
        return;
      }
      this.passwordError = '';
      try {
        await axios.post('http://localhost:3000/admin/managers', this.newManager, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Réinitialiser le formulaire
        this.newManager.username = '';
        this.newManager.password = '';
        this.newManager.email = '';
        this.confirmPassword = '';

        alert('Manager ajouté avec succès');
        this.fetchManagers(); // Rafraîchir la liste des managers
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.errorMessage = error.response.data.error;
        } else {
          this.errorMessage = 'Erreur lors de l\'ajout du manager. Veuillez réessayer plus tard.';
        }
      }
    },
    toggleAddManagerForm() {
      this.showAddManagerForm = !this.showAddManagerForm;
      // Réinitialiser le formulaire si on le cache
      if (!this.showAddManagerForm) {
        this.newManager = {
          username: '',
          password: '',
          email: ''
        };
        this.confirmPassword = '';
        this.passwordError = '';
      }
    },
    async fetchManagers() {
      try {
        const response = await axios.get('http://localhost:3000/admin/managers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.managers = response.data;
      } catch (error) {
        console.error('Error fetching managers:', error);
        this.errorMessage = 'Erreur lors de la récupération des managers. Veuillez réessayer plus tard.';
      }
    },
    openEditForm(manager) {
      this.selectedManager = { ...manager }; // Crée une copie du manager
      this.showEditForm = true;
    },
      async updateManager() {
    if (this.selectedManager.password && this.selectedManager.password !== this.confirmEditPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.passwordError = '';
    try {
      const updateData = {
        username: this.selectedManager.username,
        email: this.selectedManager.email
      };
      if (this.selectedManager.password) {
        updateData.password = this.selectedManager.password;
      }
      await axios.put(`http://localhost:3000/admin/managers/${this.selectedManager.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Mettre à jour le manager dans la liste locale
      const index = this.managers.findIndex(m => m.id === this.selectedManager.id);
      if (index !== -1) {
        this.managers.splice(index, 1, { ...this.selectedManager });
      }
      this.showEditForm = false;
      this.selectedManager = null;
      this.confirmEditPassword = '';
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        this.errorMessage = error.response.data.error;
      } else {
        this.errorMessage = 'Erreur lors de la mise à jour du manager. Veuillez réessayer plus tard.';
      }
    }
  },
    cancelEdit() {
      this.showEditForm = false;
      this.selectedManager = null;
      this.confirmEditPassword = '';
    },
    logout() {
      localStorage.removeItem('token');
      this.router.push('/login');
    }
  }
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--text-color);
}

/* General Layout */
.admin-manager {
  margin-bottom: 200%;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: var(--font-family);
  background-color: var(--card-background-color);
  color: var(--text-color);
  position: relative;
}

h1, h2, h3 {
  color: var(--heading-color);
  margin-bottom: 20px;
}

h1 {
  text-align: center;
  font-size: 2.5em;
}

/* Logout Button */
.logout-btn {
    display: inline-block;
  padding: 12px 25px;
  margin: 5px 5px 0 0;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.3s, transform 0.1s;
  background-color: var(--danger-color);
}

.logout-btn:hover {
  background-color: var(--danger-hover-color);
}

/* Form Sections */
.form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  background: var(--card-background-color);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
    font-weight: bold;
    margin-top: 10px;
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"] {
  width: 100%;
  max-width: 100%;   
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1em;
  background-color: #fff;
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus,
.form-group input[type="email"]:focus {
  border-color: var(--primary-color);
  outline: none;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 12px 25px;
  margin: 5px 5px 0 0;
  border: none;
  border-radius: 4px;
  background: var(--secondary-color); /* Dark Blue */
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.3s, transform 0.1s;
}
.btn.primary {
    width: 40%;
    display: block;
    margin: 0 auto;
    background: var(--primary-color); /* Dark Violet */
}

@media (max-width: 768px) {
    .btn.primary {
        width: 100%;
    }
}

.btn.danger {
  background: var(--danger-color); /* Red */
}

.btn:hover {
  transform: scale(0.98);
}

.btn.primary:hover {
  background: var(--primary-hover-color); /* Darker Violet */
}

.btn.danger:hover {
  background: var(--danger-hover-color); /* Darker Red */
}

/* Manager List */
.managers-section {
  margin-bottom: 40px;
}

.manager-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.manager-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: var(--card-background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s;
}

.manager-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.manager-actions .btn {
  margin-left: 10px;
}

/* Error Message */
.error-message {
  color: var(--danger-color);
  margin-top: 20px;
  font-weight: bold;
  text-align: center;
}

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .admin-manager {
    padding: 15px;
  }

  .manager-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .manager-actions {
    margin-top: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }

  .manager-actions .btn {
    margin: 5px 10px 0 0;
    flex: 1;
  }
}

.generated-password {
  margin-top: 20px;
  padding: 10px;
  background: #e0f7fa;
  border: 1px solid #b2ebf2;
  border-radius: 4px;
  color: #00796b;
  font-weight: bold;
}
</style>