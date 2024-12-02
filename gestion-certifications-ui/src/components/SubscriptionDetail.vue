<template>
  <div class="subscription-detail">
    <h1>Détails de l'Abonnement</h1>
    <div v-if="subscription">
      <p><strong>Nom de l'Entreprise :</strong> {{ subscription.enterpriseName }}</p>
      <p><strong>Date de Début :</strong> {{ formatDate(subscription.startDate) }}</p>
      <p><strong>Date de Fin :</strong> {{ formatDate(subscription.endDate) }}</p>
      <p><strong>Nombre Maximum de Managers :</strong> {{ subscription.maxManagers }}</p>
      <p><strong>Nombre Maximum d'Employés par Manager :</strong> {{ subscription.maxEmployes }}</p>
    </div>
    <div v-else>
      <p>Chargement des détails de l'abonnement...</p>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'SubscriptionDetail',
  data() {
    return {
      subscription: null,
      errorMessage: ''
    };
  },
  mounted() {
    this.fetchSubscriptionDetails();
  },
  methods: {
    async fetchSubscriptionDetails() {
      try {
        const response = await axios.get('http://localhost:3000/admin/subscription', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.subscription = response.data;
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        this.errorMessage = 'Erreur lors de la récupération des détails de l\'abonnement.';
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
  }
};
</script>

<style scoped>
.subscription-detail {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  font-family: Arial, sans-serif;
}

.subscription-detail h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

.subscription-detail p {
  font-size: 1.2em;
  margin-bottom: 15px;
}
</style>