import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import ManagerDashboard from '../components/ManagerDashboard.vue';
import EmployeeForm from '../components/EmployeeForm.vue';
import CertificationForm from '../components/CertificationForm.vue';
import EmployeeList from '../components/EmployeeManage.vue';
import CertificationList from '../components/CertificationList.vue';
import UserForm from '../components/UserForm.vue';
import LoginForm from '../components/LoginForm.vue';
import EmployeeCertifications from '../components/EmployeeList.vue';
import ManagerManage from '../components/ManageManager.vue';
import ManagerForm from '../components/ManagerForm.vue';

const routes = [
  { path: '/admin/employees', component: EmployeeList },
  { path: '/admin/employees/:id', component: EmployeeForm },
  { path: '/admin/certifications', component: CertificationList },
  { path: '/admin/certifications/:id', component: CertificationForm },
  { path: '/admin/list', component: EmployeeCertifications },
  { path: '/', name: 'Home', component: HomePage },
  { path: '/register', name: 'UserForm', component: UserForm },
  { path: '/login', name: 'LoginForm', component: LoginForm },
  { path: '/admin', component: ManagerDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/managers', component: ManagerManage, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/managers/new', component: ManagerForm}
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !['admin', 'manager'].includes(userRole)) {
    next('/');
  } else {
    next();
  }
});

export default router;