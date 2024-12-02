methods: {
    async login() {
        try {
            const response = await axios.post('http://localhost:3000/login', {
                username: this.username,
                password: this.password
            });

            // Vérifier si l'utilisateur est désactivé
            if (response.data.code === 'USER_DEACTIVATED') {
                // Rediriger vers la page de renouvellement
                this.$router.push('/renew-subscription');
                return;
            }

            // Traitement normal de la connexion
            localStorage.setItem('token', response.data.token);

            // Rediriger en fonction du rôle de l'utilisateur
            const tokenPayload = JSON.parse(atob(response.data.token.split('.')[1]));
            const userRole = tokenPayload.role;

            switch (userRole) {
                case 'superadmin':
                    this.$router.push('/superadmin');
                    break;
                case 'admin':
                    this.$router.push('/admindashboard');
                    break;
                case 'manager':
                    this.$router.push('/manager');
                    break;
                default:
                    this.errorMessage = 'Rôle utilisateur inconnu.';
            }
        } catch (error) {
            // Gérer les autres erreurs de connexion
            this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }
    }
}