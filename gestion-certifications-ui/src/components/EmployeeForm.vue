<template>
  <div>
    <h1>{{ isEdit ? 'Edit' : 'Add' }} Employee</h1>
    <form @submit.prevent="saveEmployee">
      <div>
        <label for="name">Name:</label>
        <input v-model="employee.name" id="name" required>
      </div>
      <div>
        <label for="position">Position:</label>
        <input v-model="employee.position" id="position" required>
      </div>
      <button type="submit">{{ isEdit ? 'Update' : 'Add' }} Employee</button>
    </form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      employee: { name: '', position: '' },
      isEdit: false,
      errorMessage: ''
    };
  },
  mounted() {
    // Check if an employee ID is present in the route and is a valid number
    const employeeId = this.$route.params.id;
    if (employeeId && !isNaN(employeeId)) {
      this.isEdit = true;
      this.fetchEmployee(employeeId);
    }
  },
  methods: {
    fetchEmployee(id) {
      axios.get(`http://localhost:3000/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          this.employee = response.data;
        })
        .catch(error => {
          console.error('Error fetching employee:', error);
          this.errorMessage = 'Error fetching employee data. Please try again later.';
        });
    },
    saveEmployee() {
      if (this.isEdit) {
        // If in edit mode, send a PUT request to update
        axios.put(`http://localhost:3000/employees/${this.$route.params.id}`, this.employee, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(() => {
            this.$router.push('/admin/employees');
          })
          .catch(error => {
            console.error('Error updating employee:', error);
            this.errorMessage = 'Error updating employee. Please try again later.';
          });
      } else {
        // Otherwise, send a POST request to create a new employee
        axios.post('http://localhost:3000/employees', {
          name: this.employee.name,
          position: this.employee.position
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(() => {
            this.$router.push('/admin/employees');
          })
          .catch(error => {
            console.error('Error adding employee:', error);
            this.errorMessage = 'Error adding employee. Please try again later.';
          });
      }
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>