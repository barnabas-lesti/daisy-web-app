import icons from '../../../core/theme/icons';

export default {
  routes: [
    {
      path: '/health/dashboard',
      name: 'health.dashboard',
      titleKey: 'health.views.dashboard.title',
      component: () => import(/* webpackChunkName: "health.dashboard" */ './Dashboard.vue'),
    },
  ],
  sidebarItems: [
    {
      labelKey: 'health.views.dashboard.title',
      icon: icons.mdiViewDashboardOutline,
      routeName: 'health.dashboard',
    },
  ],
};