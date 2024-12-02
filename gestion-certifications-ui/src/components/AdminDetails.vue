<template>
  <div class="admin-details">
    <h1>Détails de l'Admin</h1>
    <h2>Managers créés par {{ admin.username }}</h2>
    <table class="manager-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Nombre d'employés</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="manager in managers" :key="manager.id">
          <td>{{ manager.username }}</td>
          <td>{{ manager.email }}</td>
          <td>{{ manager.employee_count }}</td>
        </tr>
      </tbody>
    </table>
    <h2>Employés créés par les managers</h2>
    <table class="employee-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Manager</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id">
          <td>{{ employee.name }}</td>
          <td>{{ employee.email }}</td>
          <td>{{ employee.manager_name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import { useRoute } from 'vue-router';

export default {
  data() {
    return {
      admin: {},
      managers: [],
      employees: [],
      errorMessage: ''
    };
  },
  setup() {
    const route = useRoute();
    return { route };
  },
  mounted() {
    this.fetchAdminDetails();
  },
  methods: {
    async fetchAdminDetails() {
      const adminId = this.route.params.id;
      try {
        const adminResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/superadmin/admins/${adminId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.admin = adminResponse.data.admin;
        this.managers = adminResponse.data.managers;
        console.log('Admin details:', this.admin, this.managers, this.employees);
        this.employees = adminResponse.data.employees;
      } catch (error) {
        console.error('Error fetching admin details:', error);
        this.errorMessage = 'Erreur lors de la récupération des détails de l\'admin. Veuillez réessayer plus tard.';
      }
    }
  }
};
</script>

<style scoped>
.admin-details {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--text-color);
}

h1, h2 {
  color: var(--heading-color);
  margin-bottom: 20px;
}

h1 {
  text-align: center;
  font-size: 2.5em;
}

.manager-table, .employee-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}

.manager-table th, .manager-table td, .employee-table th, .employee-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.manager-table th, .employee-table th {
  background-color: var(--background-color);
  color: white;
}

.manager-table tr:nth-child(even), .employee-table tr:nth-child(even) {
  background-color: var(--background-color);
}


</style>