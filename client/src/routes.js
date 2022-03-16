import { Link } from 'react-router-dom';
import { NotFound } from 'flight-webapp-components';

import Dashboard from './Dashboard';
import JobPage from './JobPage';
import JobsPage from './JobsPage';
import ScriptPage from './ScriptPage';
import ScriptsPage from './ScriptsPage';
import TemplatePage from './TemplatePage';
import TemplateQuestionsPage from './TemplateQuestionsPage';
import TemplatesPage from './TemplatesPage';
import UnconfiguredDashboard from './UnconfiguredDashboard';

const notFoundRoute = {
  name: 'Not found',
  Component: () => (
    <NotFound
      homeLink={
        <Link
          className="btn btn-link"
          to="/"
        >
          <span>Move Along...</span>
        </Link>
      }
    />
  ),
  sideNav: true,
  key: 'notfound',
};

const routes = [
  {
    path: '/templates',
    name: 'Templates',
    Component: TemplatesPage,
    authenticated: true,
    sideNav: true,
  },
  {
    path: '/templates/:id',
    name: 'Template',
    Component: TemplatePage,
    authenticated: true,
    sideNav: true,
  },
  {
    path: '/scripts/new/:templateId',
    name: 'New script',
    Component: TemplateQuestionsPage,
    authenticated: true,
    sideNav: true,
  },
  {
    path: '/scripts',
    name: 'Scripts',
    Component: ScriptsPage,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/scripts/:id',
    name: 'Script',
    Component: ScriptPage,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/jobs',
    name: 'Jobs',
    Component: JobsPage,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/jobs/:id',
    name: 'Job',
    Component: JobPage,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/',
    name: 'Home',
    Component: Dashboard,
    sideNav: true,
  },
  notFoundRoute,
]

const unconfiguredRoutes = [
  {
    path: '/',
    name: 'Home',
    Component: UnconfiguredDashboard,
    sideNav: true,
  },
  notFoundRoute,
];

export {
  routes,
  unconfiguredRoutes,
};
