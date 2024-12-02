<template>
  <div class="expirations">
    <h1>Expirations Certifications</h1>
    <div class="filter-buttons">
      <button @click="fetchExpirations(1)" class="btn primary">Expire dans 1 Mois</button>
      <button @click="fetchExpirations(3)" class="btn primary">Expire dans 3 Mois</button>
      <button @click="fetchExpirations(6)" class="btn primary">Expire dans 6 Mois</button>
      <button @click="fetchExpired" class="btn danger">Expirés</button>
    </div>
    <div v-if="certifications.length">
      <table class="certification-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Fichiers</th>
            <th>Dates d'expiration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="certification in certifications" :key="certification.certification_id">
            <td>{{ certification.employee_name }}</td>
            <td>
              <button @click="viewPdf(certification.certification_id)" class="btn">Voir PDF - {{certification.title}}</button>
            </td>
            <td>{{ certification.issued_date }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="pdfUrl" class="pdf-container"> 
        <h2>PDF File</h2>
        <iframe :src="pdfUrl + '#toolbar=0'" class="pdf-iframe"></iframe>
        <button @click="closePdf" class="btn">Fermer PDF</button>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      certifications: [],
      errorMessage: '',
      pdfUrl: ''
    };
  },
  methods: {
    fetchExpirations(months) {
      axios.get(`http://localhost:3000/manager/expirations?months=${months}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.certifications = response.data;
        })
        .catch(error => {
          console.error('Error fetching expirations:', error);
          this.errorMessage = 'Error fetching expirations. Please try again later.';
        });
    },
    viewPdf(certificationId) {
      this.pdfUrl = `http://localhost:3000/certifications/${certificationId}/pdf?token=${localStorage.getItem('token')}`;
    },
    closePdf() {
      this.pdfUrl = '';
    },
    fetchExpired() {
      axios.get('http://localhost:3000/manager/expired', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.certifications = response.data;
        })
        .catch(error => {
          console.error('Error fetching expired certifications:', error);
          this.errorMessage = 'Error fetching expired certifications. Please try again later.';
        });
    }
  }
};
</script>

<style scoped>
.expirations {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: var(--font-family);
  background-color: var(--card-background-color);
  color: var(--text-color);
  position: relative;
}

h1, h2 {
  color: var(--heading-color);
  margin-bottom: 20px;
}

.filter-buttons {
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 8px 8px;
  font-size: 0.875rem;
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

.btn.primary {
  background: var(--primary-color); /* Dark Blue */
}

.btn.danger {
  background: var(--danger-color); /* Red */
}

.btn:hover {
  transform: scale(0.98);
}

.certification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.certification-item {
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

.certification-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.certification-table th, .certification-table td {
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: center;
  vertical-align: middle;
}

.certification-table th {
    background-color: var(--background-color);
  
  background-color: var(heading-color);
}

.certification-table tr:nth-child(even) {
  background-color: var(--background-color);
}

.certification-table tr:hover {
  background-color: #7E7E7E;
}

.filter-buttons {
  margin-bottom: 20px;
}


.error-message {
  color: var(--danger-color);
  margin-top: 20px;
  font-weight: bold;
  text-align: center;
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