import React, { useContext } from 'react';
import { Redirect, Route, Switch, useLocation } from "react-router-dom";

import {
  AnimatedRouter,
  AuthenticatedRoute,
  BrandBar,
  ConfigContext,
  Footer,
} from 'flight-webapp-components';

import styles from './AppLayout.module.css';
import { routes, unconfiguredRoutes } from './routes';

function AppLayout() {
  const { unconfigured } = useContext(ConfigContext);

  return (
    <>
      <BrandBar
        className="brandbar"
        activeApp="Job"
      />
      <div
        id="main"
      >
        <div id="toast-portal" className={styles.ToastPortal}></div>
        <div className="content">
          <AnimatedRouter
            AuthenticatedRoute={AuthenticatedRoute}
            Redirect={Redirect}
            Route={Route}
            Switch={Switch}
            exact={!unconfigured}
            routes={unconfigured ? unconfiguredRoutes : routes}
            useLocation={useLocation}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AppLayout;
