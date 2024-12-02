import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import ManagerDashboard from '../components/ManagerDashboard.vue';
import UserForm from '../components/UserForm.vue';
import LoginForm from '../components/LoginForm.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import EmployeePublicView from '../components/EmployeePublicView.vue';
import CertifExpirations from '../components/CertifExpirations.vue';
import SuperAdminDashboard from '../components/SuperAdmin.vue';
import AdminDetails from '../components/AdminDetails.vue';
import RenewSubscription from '../components/RenewSubscription.vue';
import EmployeDesactivated from '../components/EmployeDesactivated.vue';
import SubscriptionDetail from '../components/SubscriptionDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/register', name: 'UserForm', component: UserForm },
  { path: '/login', name: 'LoginForm', component: LoginForm },
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/manager', component: ManagerDashboard, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/public/employee/:id', component: EmployeePublicView },
  { path: '/manager/expirations', component: CertifExpirations },
  { path: '/superadmin', component: SuperAdminDashboard },
  { path: '/superadmin/:id', component: AdminDetails },
  { path: '/renew-subscription', component: RenewSubscription },
  { path: '/desactivated', component: EmployeDesactivated },
  { path: '/admin/subscription-detail', component: SubscriptionDetail }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== 'admin') {
    next('/');
  } else if (to.matched.some(record => record.meta.requiresManager) && userRole !== 'manager') {
    next('/');
  }  else if (to.path === '/manager' && !isAuthenticated) {
    next('/login_manager');
  } else if (to.path === '/admin' && !isAuthenticated) {
    next('/login_admin');
  } else {
    next();
  }
});

export default router;