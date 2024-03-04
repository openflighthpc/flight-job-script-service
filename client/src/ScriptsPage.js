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
import { useFetchScripts } from './api';
import BackLink from "./BackLink";

function ScriptsPage() {
  const { data, error, loading, get } = useFetchScripts();

  if (error) {
    if (utils.errorCode(data) === 'Unauthorized') {
      return (
        <>
          <BackLink/>
          <UnauthorizedError/>
        </>
      );
    } else {
      return (
        <>
          <BackLink/>
          <DefaultErrorMessage/>
        </>
      );
    }
  } else {
    const scripts = data == null ? null : data.data ;
    return (
      <>
        <BackLink/>
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
      </>
    );
  }
}

function Layout({ reloadScripts, scripts }) {
  const [selectedScript, setSelectedScript] = useState(null);

  if (scripts == null || !scripts.length) {
    return <NoScriptsFound />;
  }

  return (
    <>
      <InfoRow scripts={scripts} />
      <div>
        <Row className="scripts-table-row">
          <Col
            className="table px-0"
          >
            <ScriptsTable
              onRowSelect={setSelectedScript}
              scripts={scripts}
            />
          </Col>
          <Col
            className="notes pr-0 pl-3"
            style={{ paddingTop: 'calc(38px + 16px)' }}
          >
            <ScriptSummary
              reloadScripts={reloadScripts}
              script={selectedScript}
            />
          </Col>
        </Row>
      </div>
    </>
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

function InfoRow({ scripts }) {
  const scriptOrScripts = scripts.length === 1 ? 'script' : 'scripts';

  return (
    <div className={`row justify-content-between align-items-center mb-5`}>
      <span className={`tagline mb-0`}>
        You have {scripts.length} saved{' '}{scriptOrScripts}.
      </span>
      <div className="d-flex">
        <NewScriptButton/>
      </div>
    </div>
  );
}

function NewScriptButton() {
  return (
    <>
      <Link
        className="button link white-text"
        to="/templates"
      >
        <i className="fa fa-plus mr-2"></i>
        <span>Create new script</span>
      </Link>
    </>
  );
}

export default ScriptsPage;
