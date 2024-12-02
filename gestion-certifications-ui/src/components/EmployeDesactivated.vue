<template>
  <div class="employee-deactivated">
    <h1>Accès Indisponible</h1>
    <p>Votre compte est actuellement désactivé.</p>
    <p>Cela peut être dû au non-renouvellement de l'abonnement par votre administrateur.</p>
    <p>Veuillez contacter votre administrateur pour plus d'informations.</p>
  </div>
</template>

<script>
export default {
  name: 'EmployeDesactivated',
};
</script>

<style scoped>
.employee-deactivated {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.employee-deactivated h1 {
  font-size: 2.5em;
  color: #e74c3c;
  margin-bottom: 20px;
}

.employee-deactivated p {
  font-size: 1.2em;
  margin-bottom: 15px;
  color: #333;
}
</style>