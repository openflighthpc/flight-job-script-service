import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Row, Col } from 'reactstrap';

import {
  DefaultErrorMessage,
  Overlay,
  OverlayContainer,
  Spinner,
  UnauthorizedError,
  utils,
} from 'flight-webapp-components';

import ScriptSummary from './ScriptSummary';
import ScriptsTable from './ScriptsTable';
import styles from './index.module.css';
import { useFetchScripts } from './api';

function ScriptsPage() {
  const { data, error, loading, get } = useFetchScripts();

  if (error) {
    if (utils.errorCode(data) === 'Unauthorized') {
      return <UnauthorizedError />;
    } else {
      return <DefaultErrorMessage />;
    }
  } else {
    const scripts = data == null ? null : data.data ;
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
        { scripts != null && <Layout reloadScripts={get} scripts={scripts} /> }
      </React.Fragment>
    );
  }
}

function Layout({ reloadScripts, scripts }) {
  const [selectedScript, setSelectedScript] = useState(null);

  if (scripts == null || !scripts.length) {
    return <NoScriptsFound />;
  }

  return (
    <React.Fragment>
      <NewScriptButton/>
      <IntroCard scripts={scripts} />
      <div>
        <Row>
          <Col>
            <ScriptsTable
              onRowSelect={setSelectedScript}
              scripts={scripts}
            />
          </Col>
          <Col style={{ paddingTop: 'calc(38px + 16px)' }}>
            <ScriptSummary
              reloadScripts={reloadScripts}
              script={selectedScript}
            />
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
}

function NoScriptsFound() {
  return (
    <div>
      <p>
        No scripts found.
      </p>
      <NewScriptButton/>
    </div>
  );
}

function NewScriptButton() {
  return (
    <>
      <Link
        className="btn btn-success btn-block"
        to="/templates"
      >
        <i className="fa fa-file-code-o mr-1"></i>
        <span>Create new script</span>
      </Link>
    </>
  );
}

function IntroCard({ scripts }) {
  const scriptOrScripts = scripts.length === 1 ? 'script' : 'scripts';

  return (
    <div className={`${styles.IntroCard} ${styles.ScriptsIntroCard} card card-body mb-4`}>
      <p className={`${styles.IntroCardText} card-text`}>
        You have {scripts.length} saved{' '}{scriptOrScripts}.  Select a
        script from the table to view more details about it.
      </p>
    </div>

  );
}

export default ScriptsPage;
