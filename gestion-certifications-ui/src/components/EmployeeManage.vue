<template>
  <div>
    <h1>Employees</h1>
    <button @click="createEmployee">Add New Employee</button>
    <ul>
      <li v-for="employee in employees" :key="employee.id">
        {{ employee.name }} - {{ employee.position }} - id = {{ employee.id }}
        <router-link :to="'/admin/employees/' + employee.id">Edit</router-link>
        <button @click="deleteEmployee(employee.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      employees: []
    };
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    fetchEmployees() {
      axios.get('http://localhost:3000/employees')
        .then(response => {
          this.employees = response.data;
        })
        .catch(error => {
          console.error('Error fetching employees:', error);
        });
    },
    createEmployee() {
      this.$router.push('/admin/employees/new');
    },
    deleteEmployee(id) {
      axios.delete(`http://localhost:3000/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        console.log('Employee deleted:', response.data);
        this.employees = this.employees.filter(employee => employee.id !== id);
        this.$router.push('/admin/employees');
      })
      .catch(error => {
        console.error('Error deleting employee:', error);
        this.errorMessage = 'Error deleting employee. Please try again later.';
      });
    }
  }
};
</script>
