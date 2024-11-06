<template>
  <div>
    <h1>Manager Dashboard</h1>
    <nav>
      <router-link to="/admin/employees">Manage Employees</router-link>
      <router-link to="/admin/certifications">Manage Certifications</router-link>
      <router-link to="/admin/list">Employee List</router-link>
    </nav>
  </div>
</template>
//doit contenir plus d'imformations a voir plus tard (notamment le choix de la certification avec le choix de l'employe)
<script>
export default {
  name: 'AdminDashboard'
};
</script>

<style scoped>
nav a {
	text-decoration: none;
	text-align: center;
	margin-right: 10px;
}
</style>
