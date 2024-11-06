<template>
      <div>
    <h1>Manage Managers</h1>
    <button @click="createManager">Add New Manager</button>
    <ul>
      <li v-for="manager in managers" :key="manager.id">
        {{ manager.name }} - {{ manager.position }} - id = {{ manager.id }}
        <router-link :to="'/admin/managers/' + manager.id">Edit</router-link>
        <button @click="deleteManager(manager.id)">Delete</button>
        </li>
    </ul>
      </div>
</template>

<script>
import axios from 'axios';
  

export default {
  data() {
    return {
      managers: []
    };
  },
  mounted() {
    this.fetchManagers();
  },
  methods: {
    fetchManagers() {
      axios.get('http://localhost:3000/managers')
        .then(response => {
          this.managers = response.data;
        })
          .catch(error => {
          console.error('Error fetching managers:', error);
        });
    },
    createManager() {
      this.$router.push('/admin/managers/new');
    },
    deleteManager(id) {
      axios.delete(`http://localhost:3000/managers/${id}`, {
headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        console.log('Manager deleted:', response.data);
        this.managers = this.managers.filter(manager => manager.id !== id);
        this.$router.push('/admin/managers');
      })
      .catch(error => {
        console.error('Error deleting manager:', error);
        this.errorMessage = 'Error deleting manager. Please try again later.';
      });
    }
  }
};
</script>
