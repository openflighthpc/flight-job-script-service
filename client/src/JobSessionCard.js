import classNames from 'classnames';
import { Button } from 'reactstrap';
import { useRef } from 'react';
import get from 'lodash/get';

import {
  ActionButton,
  DefaultErrorMessage,
  Spinner,
} from 'flight-webapp-components';

import MetadataEntry from './MetadataEntry';
import Screenshot from './SessionScreenshot';
import { SessionNotFound, SessionUnknown, useFetchDesktop } from './api';
import { prettyDesktopName } from './utils';
import { getTagValue, useInterval } from './utils';

const activeStates = ['Active', 'Remote'];

function isInteractive(script) {
  return getTagValue(script.attributes.tags, 'script:type') === 'interactive';
}

function JobSessionCard({ className, job }) {
  if (!isInteractive(job.script)) {
    return null;
  }
  switch (job.attributes.state) {
    case 'SUBMITTING':
    case 'BOOTSTRAPPING':
    case 'PENDING':
      if (get(job, "relationships.desktop.data.id")) {
        return <SessionPreview className={className} job={job} />;
      } else {
        return <SessionPending className={className} />;
      }
    case 'RUNNING':
      return <SessionPreview className={className} job={job} />;
    default:
      return <SessionComplete className={className} job={job} />;
  }
}

function Layout({ button, children, className, session }) {
  let sessionName = null;
  if (session != null) {
    sessionName = session.name || session.id.split('-')[0];
  }

  return (
    <div className={classNames(className, "card")} >
      <div className="card-header d-flex flex-row justify-content-between">
        <h4 className="mb-0">Desktop session <code>{sessionName}</code></h4>
        {button}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function SessionPending({ className }) {
  return (
    <Layout className={className}>
      Your interactive session is not yet ready.  It will be available shortly
      after your job runs.
    </Layout>
  );
}

function SessionComplete({ className, job }) {
  const { data: session, error, loading } = useFetchDesktop(job.id);

  let content;
  if (loading) {
    content = <Spinner text="Loading session preview..."/>;
  } else if (error instanceof SessionUnknown) {
    content = <span>Your interactive session appears to have failed to launch.</span>
  } else {
    content = <span>Your interactive session has completed.</span>
  }

  return (
    <Layout className={className} session={session}>
      {content}
    </Layout>
  );
}

function SessionPreview({ className, job }) {
  const stateRef = useRef(null);
  const { data: session, error, get, loading } = useFetchDesktop(job.id);

  if (loading) {
    stateRef.current = 'loading';
  } else if (session) {
    stateRef.current = 'available';
  } else if (error instanceof SessionNotFound) {
    stateRef.current = 'notfound';
  } else if (error instanceof SessionUnknown) {
    stateRef.current = 'unknown';
  } else {
    stateRef.current = 'error';
  }

  useInterval(() => {
    if (['notfound', 'unknown', 'error'].includes(stateRef.current)) {
      get();
    }
  }, 1 * 60 * 1000);

  const button = stateRef.current !== 'available' ?
    <RefreshButton onRefresh={get} refreshing={loading} /> :
    <ConnectButton sessionId={session.id} />;

  return (
    <Layout
      button={button}
      className={className}
      session={session}
    >
      <SessionPreviewContent
        session={session}
        state={stateRef.current}
      />
    </Layout>
  );
}

function SessionPreviewContent({ session, state }) {
  switch (state) {
    case 'loading':
      return <Spinner text="Loading session preview..."/>;

    case 'available':
      return <SessionDetails session={session} />;

    case 'notfound':
      return (
        <div>
          Your interactive session is no longer available.
        </div>
      );

    case 'unknown':
      return (
        <div>
          Unfortunately, it has not been possible to determine your
          interactive session.  It may still be in the process of starting or it
          may have failed to start.  Your job's output may provide more
          details.
        </div>
      );

    case 'error':
    default:
      return <DefaultErrorMessage />;
  }
}

function SessionDetails({ session }) {
  return (
    <div>
      <div className="row mb-2">
        <div className="col">
          <LinkedScreenshot session={session} />
        </div>
      </div>
      <dl>
        <MetadataEntry
          name="Desktop"
          value={
            prettyDesktopName[session.desktop] || session.desktop || <em>Unknown</em>
          }
          valueTitle={
            prettyDesktopName[session.desktop] || session.desktop || 'Unknown'
          }
        />
        <MetadataEntry
          name="State"
          value={
            activeStates.includes(session.state) ? 'Active' : session.state
          }
          valueTitle={
            activeStates.includes(session.state) ?
              'This session is active.  You can connect to it to gain access.' :
              null
          }
        />
        <MetadataEntry
          name="Host"
          value={session.hostname}
          valueTitle="The machine this session is running on"
          format={host => <code>{host}</code>}
        />
      </dl>
    </div>
  );
}

function RefreshButton({ onRefresh, refreshing }) {
  return (
    <ActionButton
      act={onRefresh}
      acting={refreshing}
      actingButtonText="Refreshing..."
      buttonText="Refresh"
      color="primary"
      icon="fa-refresh"
      size="sm"
    />
  );
}

function ConnectButton({ sessionId }) {
  const href = `${process.env.REACT_APP_DESKTOP_CLIENT_BASE_URL}/sessions/${sessionId}`;

  return (
    <Button
      color="primary"
      href={href}
      size="sm"
    >
      <i className="fa fa-bolt mr-1"/>
      <span>Connect to Session</span>
    </Button>
  );
}

function LinkedScreenshot({ session }) {
  const screenshot = <Screenshot className="card-img" session={session} />;
  if (activeStates.includes(session.state)) {
    const href = `${process.env.REACT_APP_DESKTOP_CLIENT_BASE_URL}/sessions/${session.id}`;
    return <a href={href}>{screenshot}</a>;
  } else {
    return screenshot;
  }
}

export default JobSessionCard;
