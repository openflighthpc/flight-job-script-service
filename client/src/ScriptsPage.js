import React from 'react';
import { Link } from "react-router-dom";

import {
  DefaultErrorMessage,
  Overlay,
  OverlayContainer,
  Spinner,
  UnauthorizedError,
  utils,
} from 'flight-webapp-components';

import ScriptCard from './ScriptCard';
import { useFetchScripts } from './api';
import styles from './ScriptsPage.module.css';

function getScriptsFromResponse(data) {
  const scripts = utils.getResourcesFromResponse(data);
  if ( scripts == null) { return null };

  scripts.forEach((script) => {
    if (!script.denormalized) {
      Object.defineProperty(script, 'denormalized', { value: true, writable: false });

      Object.keys(script.relationships || {}).forEach((relName) => {
        const relNeedle = script.relationships[relName].data;
        Object.defineProperty(
          script,
          relName,
          {
            get: function() {
              const haystack = data.included || [];
              return haystack.find((hay) => {
                return hay.type === relNeedle.type && hay.id === relNeedle.id;
              });
            },
          },
        );
      });
    }
  });

  return scripts;
}

function ScriptsPage() {
  const { data, error, loading, get } = useFetchScripts();

  if (error) {
    if (utils.errorCode(data) === 'Unauthorized') {
      return <UnauthorizedError />;
    } else {
      return <DefaultErrorMessage />;
    }
  } else {
    const scripts = getScriptsFromResponse(data);
    return (
      <React.Fragment>
        {
          loading && (
            <OverlayContainer>
              <Overlay>
                <Spinner text="Loading scripts..."/>
              </Overlay>
            </OverlayContainer>
          )
        }
        { scripts != null && <ScriptsList reloadScripts={get} scripts={scripts} /> }
      </React.Fragment>
    );
  }
}

function NoScriptsFound() {
  return (
    <div>
      <p>
        No scripts found.  You may want to <Link to="/templates">create a
          new script</Link>.
      </p>
    </div>
  );
}

function ScriptsList({ reloadScripts, scripts }) {
  const sortedScripts = ( scripts || [] ).sort((a, b) => {
    const aName = a.attributes.name.toUpperCase();
    const bName = b.attributes.name.toUpperCase();
    if (aName < bName) {
      return -1;
    } else if (aName > bName) {
      return 1;
    } else {
      return 0
    }
  });
  if (scripts == null || !scripts.length) {
    return <NoScriptsFound />;
  }

  const cards = sortedScripts.map(script => (
    <ScriptCard
      key={script.id}
      reloadScripts={reloadScripts}
      script={script}
    />
  ));

  return (
    <>
    <IntroCard scripts={scripts} />
    <div className={`card-deck ${styles.ScriptsList}`}>
      {cards}
    </div>
    </>
  );
}

function IntroCard({ scripts }) {
  const scriptOrScripts = scripts.length === 1 ? 'script' : 'scripts';

  return (
    <div className={`${styles.IntroCard} card card-body mb-4`}>
      <p className={`${styles.IntroCardText} card-text`}>
        You have {scripts.length} saved{' '}{scriptOrScripts}.  Use the
        {' '}<i>Submit</i> button to submit a script to your cluster.
      </p>
    </div>

  );
}

export default ScriptsPage;
