import React, {useContext} from 'react';
import {Redirect, Route, Switch, useLocation} from "react-router-dom";

import {
  AnimatedRouter,
  AuthenticatedRoute,
  BrandBar,
  ConfigContext,
  Footer,
} from 'flight-webapp-components';

import styles from './AppLayout.module.css';
import {routes, unconfiguredRoutes} from './routes';
import Blurb from "./Blurb";

function AppLayout() {
  const {unconfigured} = useContext(ConfigContext);

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
          <div
            className="centernav col-8"
          >
            <div className="narrow-container">
              <Blurb/>
            </div>
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
      </div>
      <Footer/>
    </>
  );
}

export default AppLayout;
