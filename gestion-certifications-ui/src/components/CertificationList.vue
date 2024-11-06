<template>
  <div>
    <h1>Certifications</h1>
    <button @click="createCertification">Add New Certification</button>
    <ul>
      <li v-for="certification in certifications" :key="certification.id">
        {{ certification.title }} - {{ certification.pdf_url }} - {{ certification.issued_date }}
        <router-link :to="'/admin/certifications/' + certification.id">Edit</router-link>
        <button @click="deleteCertification(certification.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      certifications: []
    };
  },
  mounted() {
    this.fetchCertifications();
  },
  methods: {
    fetchCertifications() {
      axios.get('http://localhost:3000/certifications')
        .then(response => {
          this.certifications = response.data;
        })
        .catch(error => {
          console.error('Error fetching certifications:', error);
        });
    },
    createCertification() {
      this.$router.push('/admin/certifications/new');
    },
    deleteCertification(id) {
      axios.delete(`http://localhost:3000/certifications/${id}`)
        .then(() => {
          this.fetchCertifications();
        })
        .catch(error => {
          console.error('Error deleting certification:', error);
        });
    }
  }
};
</script>
