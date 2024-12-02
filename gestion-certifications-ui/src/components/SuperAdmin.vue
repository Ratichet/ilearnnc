<template>
  <div class="super-admin">
    <!-- Logout Button -->
    <button @click="logout" class="logout-btn">Logout</button>
    <!-- Button to toggle Add Admin Form -->
    <button @click="toggleAddAdminForm" class="btn toggle-btn">
      {{ showAddAdminForm ? 'Annuler' : 'Ajouter un Admin' }}
    </button>
    <h1>Super Admin Dashboard</h1>
    <!-- Add Admin Form -->
    <div v-if="showAddAdminForm" class="form-section">
      <h2>Ajouter un Admin</h2>
      <form @submit.prevent="addAdmin" class="form">
        <div class="form-group">
          <label for="adminUsername">Nom d'utilisateur : </label>
          <input v-model="newAdmin.username" id="adminUsername" type='text' required />
        </div>
        <div class="form-group">
          <label for="adminEnterprise">Nom de l'entreprise : </label>
          <input v-model="newAdmin.enterpriseName" id="adminEnterprise" type='text' required />
        </div>
        <div class="form-group">
          <label for="adminPassword">Mot de passe : </label>
          <input v-model="newAdmin.password" id="adminPassword" type="password" required />
        </div>
        <div class="form-group">
          <label for="adminEmail">Email : </label>
          <input v-model="newAdmin.email" id="adminEmail" type="email" required />
        </div>
        <div class="form-group">
          <label for="maxManagers">Nombre limite de managers : </label>
          <input v-model="newAdmin.maxManagers" id="maxManagers" type="number" required />
        </div>
        <div class="form-group">
          <label for="maxEmployes">Nombre limite d'Employés par Manager</label>
          <input v-model="newAdmin.maxEmployes" id="maxEmployes" type="number" required />
        </div>
        <div class="form-group">
          <label for="startDate">Date de début :</label>
          <input v-model="newAdmin.startDate" id="startDate" type="date" required />
        </div>
        <div class="form-group">
          <label for="endDate">Date de fin :</label>
          <input v-model="newAdmin.endDate" id="endDate" type="date" required />
        </div>
        <button type="submit" class="btn primary">Ajouter un Admin</button>
      </form>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
    <!-- List of Admins -->
    <div class="admin-list">
      <h2>Liste des Admins</h2>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Nombre de managers</th>
            <th>Statut</th>
            <th>Désactiver</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.id">
            <td>{{ admin.username }}</td>
            <td>{{ admin.email }}</td>
            <td>{{admin.max_managers}}</td>
            <td>
                <span v-if="admin.is_active">Activé</span>
                <span v-else>Désactivé</span>
            </td>
            <td>
                <button v-if="admin.is_active" @click="desactivateAdmin(admin.id)" class="btn">désactiver</button>
                <button v-else @click="reactivateAdmin(admin.id)" class="btn">Réactiver</button>
            </td>
            <td>
                <button @click="goToAdminDetails(admin.id)" class="btn">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      newAdmin: {
        username: '',
        password: '',
        email: '',
        maxManagers: 0,
        maxEmployes: 0,
        startDate: '',
        endDate: '', 
        enterpriseName: ''
      },
      admins: [],
      showAddAdminForm: false, // Propriété pour contrôler la visibilité du formulaire
      errorMessage: ''
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  mounted() {
    this.fetchAdmins();
  },
  methods: {
    toggleAddAdminForm() {
      this.showAddAdminForm = !this.showAddAdminForm;
    },
    async addAdmin() {
      try {
        await axios.post('http://localhost:3000/superadmin/admins', this.newAdmin, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Réinitialiser le formulaire
        this.newAdmin.username = '';
        this.newAdmin.enterpriseName = '';
        this.newAdmin.password = '';
        this.newAdmin.email = '';
        this.newAdmin.maxManagers = 0;
        this.newAdmin.maxEmployes = 0;
        this.newAdmin.startDate = '';
        this.newAdmin.endDate = '';

        alert('Admin ajouté avec succès');
        this.fetchAdmins(); // Rafraîchir la liste des admins
        this.showAddAdminForm = false; // Cacher le formulaire après l'ajout
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            this.errorMessage = error.response.data.error;
        } else {
            this.errorMessage = 'Erreur lors de l\'ajout de l\'admin. Veuillez réessayer plus tard.';
        }
      }
    },
    async fetchAdmins() {
      try {
        const response = await axios.get('http://localhost:3000/superadmin/admins', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.admins = response.data;
      } catch (error) {
        console.error('Error fetching admins:', error);
        this.errorMessage = 'Erreur lors de la récupération des admins. Veuillez réessayer plus tard.';
      }
    },
    async desactivateAdmin(adminId) {
      try {
        const confirmDeactivation = confirm('Êtes-vous sûr de vouloir désactiver cet admin ? Cette action désactivera aussi tous les managers et employés associés.');
        if (!confirmDeactivation) {
          return;
        }

        await axios.put(`http://localhost:3000/superadmin/admins/${adminId}/deactivate`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Admin désactivé avec succès.');
        this.fetchAdmins(); // Rafraîchir la liste des admins
      } catch (error) {
      console.error('Error deactivating admin:', error);
      this.errorMessage = 'Erreur lors de la désactivation de l\'admin. Veuillez réessayer plus tard.';
      }
    },
    async reactivateAdmin(adminId) {
    try {
        const confirmReactivation = confirm('Êtes-vous sûr de vouloir réactiver cet admin ? Cette action réactivera aussi tous les managers et employés associés.');
        if (!confirmReactivation) {
        return;
        }

        await axios.put(`http://localhost:3000/superadmin/admins/${adminId}/reactivate`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
        });
        alert('Admin réactivé avec succès.');
        this.fetchAdmins(); // Rafraîchir la liste des admins
      } catch (error) {
        console.error('Error reactivating admin:', error);
        this.errorMessage = 'Erreur lors de la réactivation de l\'admin. Veuillez réessayer plus tard.';
      }
    },
    goToAdminDetails(adminId) {
      this.router.push(`/superadmin/${adminId}`);
    },
    logout() {
      localStorage.removeItem('token');
      this.router.push('/login');
    }
  }
};
</script>

<style scoped>
.super-admin {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: var(--font-family);
  text-align: center;
  background-color: rgba(0, 0, 0, 0.445);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-block;
  padding: 12px 25px;
  margin: 5px 5px 0 0;
  border: none;
  border-radius: 4px;
  background: var(--danger-color); /* Dark Blue */
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.3s, transform 0.1s;
}

.logout-btn:hover {
    background: var(--danger-hover-color); /* Darker Blue */
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
.form-group input[type="email"],
.form-group input[type="number"],
.form-group input[type="date"] {
  width: 100%;
  color: var(--text-color);
  max-width: 100%;   
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1em;
  background-color: rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus,
.form-group input[type="number"]:focus
.form-group input[type="date"]:focus
.form-group input[type="email"]:focus {
  border-color: var(--primary-color);
  outline: none;
}


input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0px 1000px rgba(0, 0, 0, 0.1) inset;
    -webkit-text-fill-color: #ffffff;
    transition: background-color 5000s ease-in-out 0s;
  background-color: rgba(0, 0, 0, 0.2);

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

.toggle-btn {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
}

.toggle-btn:hover {
    background-color: var(--primary-color-dark);
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

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th, .admin-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.admin-table th {
  background-color: var(--card-background-color);
  color: rgb(252, 252, 252);
}

.admin-table tr:nth-child(even) {
  background-color: rgb(0, 0, 0, 0.8);
}

.admin-table tr:hover {
  background-color: rgb(0, 26, 6);
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