<template>
  <div class="employee-public-view">
    <div v-if="!isAuthenticated">
      <h2>Entrer le mot de passe pour voir les détails</h2>
      <form @submit.prevent="authenticate">
        <div class="form-group">
          <label for="password">Mot de Passe:</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <button type="submit" class="btn primary">Soumettre</button>
      </form>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
    <div v-else>
      <h1>{{ employee.name }}</h1>
      <p><strong>Position:</strong> {{ employee.position }}</p>
      <h2>Certifications</h2>
      <ul>
        <li v-for="certification in certifications" :key="certification.id">
          <strong>{{ certification.title }}</strong> - 
          <span v-if="certification.expire" class="expired-message">
            (Cette certification a expirée le {{ formatDate(certification.issued_date) }} )
          </span>
          <span v-else>
            expire le {{ formatDate(certification.issued_date) }}
          </span> - 
          <button @click="viewPdf(certification.id)" class="btn">Voir PDF</button>
        </li>
      </ul>
      <div v-if="pdfUrl" class="pdf-container"> 
        <h2>PDF File</h2>
        <iframe :src="pdfUrl + '#toolbar=0'" class="pdf-iframe"></iframe>
        <button @click="closePdf" class="btn">Fermer PDF</button>
      </div>
      <button @click="togglePasswordForm" class="btn">Changer le mot de passe</button>
      <div v-if="showPasswordForm" class="password-form">
        <h3>Change Password</h3>
        <form @submit.prevent="updatePassword">
          <div class="form-group">
            <label for="currentPassword">Current Password:</label>
            <input v-model="currentPassword" type="password" id="currentPassword" required />
          </div>
          <div class="form-group">
            <label for="newPassword">New Password:</label>
            <input v-model="newPassword" type="password" id="newPassword" required />
          </div>
          <div class="form-group">
            <label for="confirmNewPassword">Confirm New Password:</label>
            <input v-model="confirmNewPassword" type="password" id="confirmNewPassword" required />
          </div>
          <button type="submit" class="btn primary">Update Password</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      employee: null,
      certifications: [],
      password: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      isAuthenticated: false,
      showPasswordForm: false,
      pdfUrl: '', // Add this line
      errorMessage: '',
    };
  },
  methods: {
    authenticate() {
    const employeeId = this.$route.params.id;
    axios.post(`${process.env.VUE_APP_API_BASE_URL}/public/employees/${employeeId}`, { password: this.password })
      .then(response => {
        this.employee = response.data.employee;
        this.certifications = response.data.certifications;
        this.isAuthenticated = true;
        this.errorMessage = '';
      })
      .catch(error => {
        if (error.response) {
          if (error.response.data.code === 'ACCOUNT_DESACTIVATED') {
            this.$router.push('/desactivated');
          } else {
            this.errorMessage = 'Mot de passe incorrect. Veuillez réessayer.';
          }
        } else {
          console.error('Error fetching employee data:', error);
          this.errorMessage = 'Erreur lors de la connexion. Veuillez réessayer plus tard.';
        }
      });
  },
    togglePasswordForm() {
      this.showPasswordForm = !this.showPasswordForm;
    },
    updatePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.errorMessage = 'New passwords do not match.';
        return;
      }

      const employeeId = this.$route.params.id;
      axios.put(`${process.env.VUE_APP_API_BASE_URL}/employees/${employeeId}/password`, {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(() => {
          this.showPasswordForm = false;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          alert('Password updated successfully');
        })
        .catch(error => {
          console.error('Error updating password:', error);
          this.errorMessage = 'Error updating password. Please try again later.';
        });
    },
    viewPdf(certificationId) {
      this.pdfUrl = `${process.env.VUE_APP_API_BASE_URL}/${certificationId}/pdf?token=${localStorage.getItem('token')}`;
    },
    closePdf() {
      this.pdfUrl = '';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<style scoped>
.employee-public-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--card-background-color);
  color: var(--text-color);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1, h2, h3 {
  color: var(--heading-color);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input[type="password"] {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1em;
  background-color: var(--card-background-color);
  transition: border-color 0.3s;
}

.form-group input[type="password"]:focus {
  border-color: var(--primary-color);
  outline: none;
}

.expired-message {
  color: red;
}

.btn {
    display: inline-block;
    padding: 12px 25px;
    margin: 5px 5px 0 0;
    border: none;
    border-radius: 4px;
    background: var(--primary-color); /* Dark Blue */
    color: #fff;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    transition: background 0.3s, transform 0.1s;
}

.btn {
  background: var(--secondary-color);
  color: var(--text-color);
}

.btn:hover {
  background: var(--secondary-hover-color);
}

.btn:active {
  transform: scale(0.98);
}

.error-message {
  color: var(--error-color);
  margin-top: 20px;
  font-weight: bold;
  text-align: center;
}

.password-form {
  margin-top: 20px;
  padding: 20px;
  background: var(--input-background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
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
</style>
