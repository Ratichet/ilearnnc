<template>
  <div class="manager-dashboard">
    <!-- Logout Button -->
    <button @click="logout" class="btn logout-btn">Logout</button>
    <!-- Add Employee Form -->
        <h1>Manager Dashboard</h1>
    <div>
    <div class="button-group buttons-inline">
        <router-link to="manager/expirations"><button class="btn">Expirations</button></router-link>
        <button @click="toggleAddEmployeeForm" class="btn primary">{{ addEmployeeButtonText }}</button>
    </div>
      <form v-if="showAddEmployeeForm" @submit.prevent="addEmployee" class="form-section">
        <div class="form-group">
          <label for="employeeName">Nom : </label>
          <input v-model="newEmployee.name" id="employeeName" type='text' required />
        </div>
        <div class="form-group">
          <label for="employeePosition">Position : </label>
          <input v-model="newEmployee.position" id="employeePosition" type='text' required />
        </div>
        <div class="form-group">
          <label for="employeeEmail">Email : </label>
          <input v-model="newEmployee.email" id="employeeEmail" type="email" required />
        </div>
        <button type="submit" class="btn primary">Ajouter l'employé</button>
      </form>
      <div v-if="generatedPassword" class="generated-password">
        <p>Mot de passe généré : <strong>{{ generatedPassword }}</strong></p>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <!-- Add Certification Form -->
    <div class="form-section" v-if="selectedEmployeeForAdding">
      <h2>Add Certification for {{ selectedEmployeeForAdding.name }}</h2>
      <form @submit.prevent="saveCertification" enctype="multipart/form-data" class="form">
        <div class="form-group">
          <label for="title">Titre : </label>
          <input v-model="certification.title" id="title" required  type='text'/>
        </div>
        <div class="form-group">
          <label for="pdf">Fichier PDF:</label>
          <input @change="handleFileUpload" type="file" id="pdf" required />
        </div>
        <div class="form-group">
          <label for="issued_date">Date d'expiration:</label>
          <input v-model="certification.issued_date" type="date" id="issued_date" required />
        </div>
        <button type="submit" class="btn">Ajouter</button>
        <button @click="resetForms" type="button" class="btn">annuler</button>
      </form>
    </div>
    <!-- Certifications List -->
    <div class="certifications-section" v-if="certifications.length && selectedEmployeeForViewing">
      <h2>Certifications de {{ selectedEmployeeForViewing.name }}</h2>

      <!-- Display QR Code -->
      <div v-if="qrCodeData" class="qr-code-container">
        <h3>Scannez le QR ou cliquez pour voir les details</h3>
        <a :href="publicEmployeeUrl" target="_blank">
          <img :src="qrCodeData" alt="QR Code" />
        </a>
      </div>
    
      <ul class="certification-list">
        <li v-for="certification in certifications" :key="certification.id" class="certification-item">
          <span>{{ certification.title }}</span>
          <div class="certification-actions">
            <button @click="viewCertification(certification.id)" class="btn">Voir PDF</button>
            <button @click="deleteCertification(certification.id)" class="btn danger">Supprimer</button>
          </div>
        </li>
      </ul>
      <button @click="resetForms" class="btn">Retour</button>
    </div>

    <!-- Employees List -->
    <!-- PDF Viewer -->
    <div class="pdf-container" v-if="pdfUrl">
      <h2>PDF File</h2>
      <iframe :src="pdfUrl + '#toolbar=0'" class="pdf-iframe"></iframe>
      <button @click="closePdf" class="btn">Close PDF</button>
    </div>
    <div class="form-section" v-if="employees.length">
      <h2>Employees</h2>
      <ul class="employee-list">
        <li v-for="employee in sortedEmployees" :key="employee.id" class="employee-item">
          <span class="list-name">{{ employee.name }} - {{ employee.position }}</span>
          <div class="employee-actions">
            <button @click="selectEmployee(employee)" class="btn">Ajouter une Certification</button>
            <button @click="viewCertifications(employee.id)" class="btn">Voir Certifications</button>
            <button @click="deleteEmployee(employee.id)" class="btn danger">Supprimer Employé</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import axiosInstance from 'axios'; 

export default {
  data() {
    return {
      employees: [],
      selectedEmployeeForAdding: null,
      selectedEmployeeForViewing: null,
      certifications: [],
      certification: { title: '', issued_date: '' },
      pdfFile: null,
      pdfUrl: '',
      errorMessage: '',
      newEmployee: { name: '', position: '', email: '' }, // Add email field
      generatedPassword: '',
      qrCodeData: '',
      publicEmployeeUrl: '',
      showAddEmployeeForm: false,
      addEmployeeButtonText: 'Ajouter un employé'
    };
  },
  mounted() {
    this.fetchEmployees();
  },
  computed: {
    sortedEmployees() {
      return this.employees.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  methods: {
    fetchEmployees() {
      axiosInstance.get('http://localhost:3000/manager/employees', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.employees = response.data;
        })
        .catch(error => {
          this.$router.push('/login_manager');
          console.error('Error fetching employees:', error);
          this.errorMessage = 'Error fetching employees. Please try again later.';
        });
    },
    addEmployee() {
      axios.post('http://localhost:3000/employees', this.newEmployee, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.newEmployee = { name: '', position: '', email: '' }; // Reset form fields
          this.generatedPassword = response.data.password;
          this.employees.push({ ...response.data.employee, generatedPassword: response.data.password });
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error)
            this.errorMessage = error.response.data.error;
          else
            this.errorMessage = 'Error adding employes. Please try again later.';
        });
    },
    toggleAddEmployeeForm() {
      this.showAddEmployeeForm = !this.showAddEmployeeForm;
      this.addEmployeeButtonText = this.showAddEmployeeForm ? 'Annuler' : 'Ajouter un employé';
    },
    selectEmployee(employee) {
      this.selectedEmployeeForAdding = employee;
      this.selectedEmployeeForViewing = null;
      this.certification = { title: '', issued_date: '' };
      this.pdfFile = null;
      this.certifications = [];
      this.pdfUrl = '';
      this.errorMessage = '';
    },
    viewCertifications(employeeId) {
      this.selectedEmployeeForViewing = this.employees.find(emp => emp.id === employeeId) || null;
      this.selectedEmployeeForAdding = null;
      this.certifications = [];
      this.pdfUrl = '';
      this.errorMessage = '';

      axios.get(`http://localhost:3000/employees/${employeeId}/certifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.certifications = response.data;
        })
        .catch(error => {
          console.error('Error fetching certifications:', error);
          this.errorMessage = 'Cet employé n\'a pas de certifications.';
        });

      // Fetch QR code for the employee
      axios.get(`http://localhost:3000/employees/${employeeId}/qrcode`)
        .then(response => {
          this.qrCodeData = response.data.qrCodeData;
          this.publicEmployeeUrl = `http://localhost:8080/public/employee/${employeeId}`;
        })
        .catch(error => {
          console.error('Error fetching QR code:', error);
          this.errorMessage = 'Error fetching QR code. Please try again later.';
        });
    },
    handleFileUpload(event) {
      this.pdfFile = event.target.files[0];
    },
    saveCertification() {
      const formData = new FormData();
      formData.append('employee_id', this.selectedEmployeeForAdding.id);
      formData.append('title', this.certification.title);
      formData.append('issued_date', this.certification.issued_date);
      formData.append('pdf', this.pdfFile);

      axios.post('http://localhost:3000/certifications', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(() => {
          this.resetForms();
          this.fetchEmployees();
        })
        .catch(error => {
          console.error('Error saving certification:', error);
          this.errorMessage = 'Error saving certification. Please try again later.';
        });
    },
    viewCertification(certificationId) {
      this.pdfUrl = `http://localhost:3000/certifications/${certificationId}/pdf?token=${localStorage.getItem('token')}`;
    },
    deleteCertification(certificationId) {
      axios.delete(`http://localhost:3000/certifications/${certificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(() => {
          this.viewCertifications(this.selectedEmployeeForViewing.id);
        })
        .catch(error => {
          console.error('Error deleting certification:', error);
          this.errorMessage = 'Error deleting certification. Please try again later.';
        });
    },
    deleteEmployee(employeeId) {
      axios.delete(`http://localhost:3000/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(() => {
          this.fetchEmployees();
        })
        .catch(error => {
          console.error('Error deleting employee:', error);
          this.errorMessage = 'Error deleting employee. Please try again later.';
        });
    },
    closePdf() {
      this.pdfUrl = '';
    },
    resetForms() {
      this.selectedEmployeeForAdding = null;
      this.selectedEmployeeForViewing = null;
      this.certifications = [];
      this.certification = { title: '', issued_date: '' };
      this.pdfFile = null;
      this.pdfUrl = '';
      this.errorMessage = '';
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
};
</script>

<style>
:root {
  --primary-color: #000280;          /* bleu */
  --secondary-color: #0e9714;        /* vert */
  --danger-color: #af0202;           /* Rouge */
  --background-color:rgba(0, 0, 0, 0.295);       /* Violet foncé */
  --card-background-color: rgba(0, 0, 0, 0.295); /* noir semi-transparent */
  --text-color: #ffffff;                /* Blanc */
  --heading-color: #ffffff;             /* Blanc */
  --border-color: rgba(255, 255, 255, 0.2); /* Bordure légère */
  --hover-color: #990099;            /* Violet plus foncé */
  --primary-hover-color: #010258;    /* bleu plus foncé */
  --secondary-hover-color: #016106;  /* vert plus foncé */
  --danger-hover-color: rgb(97, 11, 11);     /* Rouge plus foncé */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>

<style scoped>


body {
    margin: 0;
    font-family: var(--font-family);
    background-color: var(--background-color);
    color: var(--text-color);
}

/* General Layout */
.manager-dashboard {
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
    position: absolute;
    top: 20px;
    right: 20px;
}

.buttons-inline {
  display: flex;
  gap: 10px; /* Espace entre les boutons */
}

.buttons-inline .btn {
  flex: none;
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

.list-name{
    font-weight: bold;
    margin-top: 10px;
}


.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"],
.form-group input[type="date"],
.form-group input[type="file"] {
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
.form-group input[type="email"]:focus,
.form-group input[type="date"]:focus,
.form-group input[type="file"]:focus {
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
    background: var(--danger-color);
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

/* Employee List */
.employee-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.employee-item {
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


.employee-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.employee-actions .btn {
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
    .manager-dashboard {
        padding: 15px;
    }

    .employee-item {
        flex-direction: column;
        align-items: center;
        width: 80%;
    }

    .employee-actions {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: flex-start;
    }

    .employee-actions .btn {
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

.qr-code-container {
    text-align: center;
    margin-top: 20px;
}

.qr-code-container img {
    max-width: 100%;
    height: auto;
}

.certification-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.certification-item {
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

.certification-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.certification-actions .btn {
    margin-left: 10px;
}


.pdf-container {
  margin-top: 20px;
  text-align: center;
}

.pdf-iframe {
  width: 100%;
  height: 600px;
  border: none;
  margin-bottom: 10px;
}
@media (max-width: 768px) {
    .pdf-iframe {
        height: 500px;
    }
}
</style>
