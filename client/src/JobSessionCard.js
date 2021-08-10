import { Button } from 'reactstrap';
import classNames from 'classnames';

import {
  DefaultErrorMessage,
  Spinner,
} from 'flight-webapp-components';

import MetadataEntry from './MetadataEntry';
import Screenshot from './SessionScreenshot';
import { SessionNotFound, SessionUnknown, useFetchDesktop } from './api';
import { prettyDesktopName } from './utils';

const activeStates = ['Active', 'Remote'];

function JobSessionCard({ className, job }) {
  if (job.attributes.interactive !== true) {
    return null;
  }
  switch (job.attributes.state) {
    case 'PENDING':
      return <SessionPending className={className} />;
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
    <Layout
      button={<ConnectButton disabled />}
      className={className}
    >
      Your interactive session is not yet ready.  It will be available shortly
      after your job runs.
    </Layout>
  );
}

function SessionComplete({ className, job }) {
  const { data: session, loading } = useFetchDesktop(job.id);

  let content;
  if (loading) {
    content = <Spinner text="Loading session preview..."/>;
  } else if (session?.id) {
    content = <span>Your interactive session has completed.</span>
  } else {
    content = <span>Your interactive session appears to have failed to launch.</span>
  }

  return (
    <Layout
      button={<ConnectButton disabled />}
      className={className}
      session={session}
    >
      {content}
    </Layout>
  );
}

function SessionPreview({ className, job }) {
  const { data: session, error, loading } = useFetchDesktop(job.id);

  return (
    <Layout
      button={
        <ConnectButton
          disabled={loading || error}
          sessionId={session?.id}
        />
      }
      className={className}
      session={session}
    >
      <SessionPreviewContent
        error={error}
        loading={loading}
        session={session}
      />
    </Layout>
  );
}

function SessionPreviewContent({ error, loading, session }) {
  if (loading) {
    return <Spinner text="Loading session preview..."/>;
  }

  if (session) {
    return <SessionDetails session={session} />;
  }

  if (error instanceof SessionNotFound) {
    return (
      <div>
        Your interactive session is no longer available.
      </div>
    );
  }

  if (error instanceof SessionUnknown) {
    return (
      <div>
        Unfortunately, it has not been possible to determine your
        interactive session.
      </div>
    );

  }

  return <DefaultErrorMessage />;
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

function ConnectButton({ disabled, sessionId }) {
  const href = sessionId ?
    `${process.env.REACT_APP_DESKTOP_CLIENT_BASE_URL}/sessions/${sessionId}` :
    '#';

  return (
    <Button
      color="primary"
      disabled={disabled}
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
