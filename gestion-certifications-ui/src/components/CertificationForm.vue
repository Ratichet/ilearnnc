<template>
  <div>
    <h1>{{ isEdit ? 'Edit' : 'Add' }} Certification</h1>
    <form @submit.prevent="saveCertification">
      <div>
        <label for="employeeId">Employee ID:</label>
        <input v-model="certification.employee_id" id="employeeId" required>
      </div>
      <div>
        <label for="title">Title:</label>
        <input v-model="certification.title" id="title" required>
      </div>
      <div>
        <label for="pdf_url">PDF URL:</label>
        <input v-model="certification.pdf_url" id="pdf_url" required>
      </div>
      <div>
        <label for="issued_date">Issued Date:</label>
        <input v-model="certification.issued_date" type="date" id="issued_date" required>
      </div>
      <button type="submit">{{ isEdit ? 'Update' : 'Add' }} Certification</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      certification: { employee_id: '', title: '', pdf_url: '', issued_date: '' },
      isEdit: false
    };
  },
  methods: {
    fetchCertification(id) {
      axios.get(`http://localhost:3000/certifications/${id}`)
        .then(response => {
          this.certification = response.data;
        })
        .catch(error => {
          console.error('Error fetching certification:', error);
        });
    },
    saveCertification() {
      if (this.isEdit) {
        axios.put(`http://localhost:3000/certifications/${this.$route.params.id}`, this.certification)
          .then(() => {
            this.$router.push('/admin/certifications');
          })
          .catch(error => {
            console.error
            console.error('Error updating certification:', error);
          });
      } else {
        axios.post('http://localhost:3000/certifications', this.certification)
          .then(() => {
            this.$router.push('/admin/certifications');
          })
          .catch(error => {
            console.error('Error adding certification:', error);
          });
      }
    }
  }
};
</script>
