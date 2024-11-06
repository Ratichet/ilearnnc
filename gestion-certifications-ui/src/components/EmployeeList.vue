<template>
  <div>
    <h1>Employees</h1>
    <ul>
      <li v-for="employee in employees" :key="employee.id">
        <strong>{{ employee.name }}</strong> - {{ employee.position }}
        <button @click="fetchCertifications(employee.id, employee.name)">View Certifications</button>
      </li>
    </ul>

    <!-- Section pour afficher les certifications d'un employé sélectionné -->
    <div v-if="certifications.length > 0">
      <h2>Certifications for {{ selectedEmployeeName }}</h2>
      <ul>
        <li v-for="certification in certifications" :key="certification.id">
          <strong>{{ certification.title }}</strong> - 
          <a :href="certification.pdf_url" target="_blank">View PDF</a> - 
          {{ formatDate(certification.issued_date) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      employees: [],  // Liste des employés
      certifications: [],  // Certifications de l'employé sélectionné
      selectedEmployeeId: null,  // ID de l'employé sélectionné
      selectedEmployeeName: '',  // Nom de l'employé sélectionné
    };
  },
  mounted() {
    this.fetchEmployees();  // Charger les employés au démarrage
  },
  methods: {
    // Charger la liste des employés
    fetchEmployees() {
      axios.get('http://localhost:3000/employees')
        .then(response => {
          this.employees = response.data;
        })
        .catch(error => {
          console.error('Error fetching employees:', error);
        });
    },
    // Charger les certifications d'un employé
    fetchCertifications(employeeId, employeeName) {
      axios.get(`http://localhost:3000/certifications/${employeeId}`)
        .then(response => {
          this.certifications = response.data;
          this.selectedEmployeeId = employeeId;
          this.selectedEmployeeName = employeeName;
        })
        .catch(error => {
          console.error('Error fetching certifications:', error);
        });
    },
    // Formater la date
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  }
};
</script>

<style scoped>
h1, h2 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

a {
  color: blue;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
