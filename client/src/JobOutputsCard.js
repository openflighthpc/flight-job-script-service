import React from 'react';
import classNames from 'classnames';
import { Button, ButtonToolbar, ListGroup, ListGroupItem } from 'reactstrap';
import { useState } from 'react';

import {
  DefaultErrorMessage,
  Overlay,
  OverlayContainer,
  Spinner,
  utils,
} from 'flight-webapp-components';

import humanFileSize from './humanFileSize';
import styles from './index.module.css';
import { mimeTypeToIcon } from './mimeType';
import {
  useFetchOutputFiles,
  useFetchResultFiles,
  useFetchFileContent,
  useFetchJobInteractiveSession,
  useFetchDesktop,
} from './api';
import { useInterval } from './utils';

export function getResourceFromResponse(data) {
  if (!utils.isObject(data)) { return null; }
  return data.data;
}

function JobOutputsCard({ job }) {
  const [selected, setSelected] = useState(null);

  // Supports selecting files or the desktop session
  function isSelected(item) {
    if (!selected) {
      return false;
    } else if (selected.id !== item.id) {
      return false;
    } else if (selected.session !== item.session) {
      return false;
    } else {
      return true
    }
  }

  function toggleSelected(item) {
    isSelected(item) ? setSelected(null) : setSelected(item)
  }

  const isInteractive = job.attributes.interactive;
  const hasFiles = true;

  return (
    <div className="card">
      <div className="card-header d-flex flex-row justify-content-between">
        <h4 className="mb-0">Output and results</h4>
      </div>
      <div className="card-body">
        <h6 className="font-weight-bold">Job script output</h6>
        <OutputListingAsync
          className="ml-4 mb-3"
          isSelected={isSelected}
          job={job}
          toggleSelected={toggleSelected}
        />
        <h6
          className="d-flex flex-row align-items-center justify-content-between"
        >
          <span
            className="font-weight-bold"
            title={job.attributes.resultsDir}
          >
            Results directory
          </span>
          <OpenDirectoryButtons dir={job.attributes.resultsDir} />
        </h6>
        <ResultsListingAsync
          className="ml-4 mb-3"
          isSelected={isSelected}
          job={job}
          toggleSelected={toggleSelected}
        />
        {
          isInteractive ?
            (
              <>
              <hr/>
              <InteractiveSessionAsync
                className="ml-4 mb-3"
                isSelected={isSelected}
                job={job}
                toggleSelected={toggleSelected}
              />
              </>
            ) :
            null
        }
        {
          hasFiles ?
            (
              <>
              <hr/>
              <Preview job={job} selected={selected} />
              </>
            ) :
            null
        }
      </div>
    </div>
  );
}

function FileItem({ file, isSelected, name, nameTag="span", toggleSelected }) {
  const isViewable = file.attributes.mimeType.split('/')[0] === 'text';
  const isActive = isSelected(file);
  const NameTag = nameTag;

  return (
    <ListGroupItem
      className={classNames({ [styles.FileItemNonViewable]: !isViewable})}
      key={file.attributes.filename}
      active={isActive}
      action={isViewable}
      onClick={() => isViewable && toggleSelected(file)}
      tag="a"
      href={isViewable ? '#' : null}
      title={isViewable ? null : 'Previewing files of this type is not supported.  To view the file, you can open the results directory in the File manager.'}
    >
      <span className="d-flex flex-row align-items-center justify-content-between">
        <span>
          <i
            className={classNames("mr-2 fa", mimeTypeToIcon(file.attributes.mimeType))}
            title={file.attributes.mimeType}
          ></i>
          <NameTag
            className={classNames({ [styles.FileItemActiveColor] : isActive })}
            title={file.attributes.path}
          >
            {name}
          </NameTag>
        </span>
        <span
          className={classNames("text-small",
            isActive ? styles.FileItemActiveColor : 'text-muted'
          )}
        >
          {humanFileSize(file.attributes.size, true, 1)}
        </span>
      </span>
    </ListGroupItem>
  );
}

function OutputListingAsync({ className, isSelected, job, toggleSelected }) {
  const { data, error, loading, get } = useFetchOutputFiles(job.id);
  useInterval(get, 1 * 60 * 1000);

  if (error) {
    return (
      <div className={className}>
        The job's output files are not currently available.
      </div>
    );
  } else if (!data && loading) {
    // Loading the files for the first time.
    return (
      <div className="mb-2">
        <Spinner text="Loading job output files..." />
      </div>
    );
  } else {
    const files = utils.getResourcesFromResponse(data) || [];

    return (
      <React.Fragment>
        { loading && <Loading text="Loading job output files..." /> }
        <OutputListing
          className={className}
          isSelected={isSelected}
          job={job}
          files={files}
          toggleSelected={toggleSelected}
        />
      </React.Fragment>
    );
  }
}

function OutputListing({ className, isSelected, job, files, toggleSelected }) {
  const mergedStderr = job.attributes.mergedStderr;

  if (files.length === 0) {
    return (
      <div className={className}>
        The job's output files are not currently available.
      </div>
    );
  }

  const isStdErrFile = (file) => file.id === `${job.id}.stderr`;

  return (
    <ListGroup className={className}>
      {
        files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            isSelected={isSelected}
            name={
              isStdErrFile(file) ?
                'Standard error' :
                mergedStderr ?
                'Standard output and error' :
                'Standard output'
            }
            toggleSelected={toggleSelected}
          />
        ))
      }
    </ListGroup>
  );
}

function ResultsListingAsync({ className, isSelected, job, toggleSelected }) {
  const { data, error, loading, get } = useFetchResultFiles(job.id);
  useInterval(get, 1 * 60 * 1000);

  if (error) {
    <div className={className}>
      The job did not report its results directory.
    </div>
  } else if (!data && loading) {
    return (
      <div className="mb-2">
        <Spinner text="Loading job results..." />
      </div>
    );
  } else {
    const files = utils.getResourcesFromResponse(data) || [];

    return (
      <React.Fragment>
        { loading && <Loading text="Loading job results..." /> }
        <ResultsListing
          className={className}
          isSelected={isSelected}
          job={job}
          files={files}
          toggleSelected={toggleSelected}
        />
      </React.Fragment>
    );
  }
}

function ResultsListing({ className, files, isSelected, job, toggleSelected }) {
  if (job.attributes.resultsDir == null) {
    <div className={className}>
      The job did not report its results directory.
    </div>
  }
  if (files.length === 0){
    return (
      <div className={className}>
        The job's result directory is empty or not currently available.
      </div>
    );
  }
  return (
    <ListGroup className={classNames(styles.ResultsListing, className)}>
      {
        files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            isSelected={isSelected}
            name={file.attributes.relativePath}
            nameTag="code"
            toggleSelected={toggleSelected}
          />
        ))
      }
    </ListGroup>
  );
}

function getContentFromResponse(data) {
  if (!utils.isObject(data)) { return null; }
  if (!utils.isObject(data.data)) { return null; }
  if (!utils.isObject(data.data.attributes)) { return null; }
  return data.data.attributes.payload;
}

function Preview({selected, job}) {
  console.log(selected);
  if (selected == null) {
    return (
      <div>
        <em>{ job.attributes.interactive ?
          "Select a text file or the desktop above to view its preview." :
          "Select a text file above to view its preview."
        }
        </em>
      </div>
    );
  } else if (selected.session) {
    return <></>
  } else {
    return <FilePreview selected={selected} job={job} />
  }
}

function FilePreview({selected, job}) {
  const filename = selected === job.stdoutFile ?
    'standard output' :
    selected === job.stderrFile ?
    'standard error' :
    selected.attributes.relativePath;

  return (
    <>
    <h6 className="card-title font-weight-bold">
      Preview for <code>{filename}</code>
    </h6>
    <FileContent file={selected} />
    </>
  );
}

function FileContent({ file }) {
  const { data, error, loading } = useFetchFileContent(file);

  if (loading) {
    return <Spinner center="none" text="Loading file..."/>;
  } else if (error) {
    return <DefaultErrorMessage />;
  }
  return (
    <pre className={classNames(styles.PreCode, styles.FileContent)}>
      <code>{getContentFromResponse(data)}</code>
    </pre>
  );
}

function OpenDirectoryButtons({ dir }) {
  if (dir == null) {
    return null;
  }
  return (
    <ButtonToolbar>
      <Button
        className="mr-2"
        color="primary"
        href={`/files/browse?dir=${dir}`}
        size="sm"
      >
        Open in file manager
      </Button>
      <Button
        color="primary"
        href={`/console/terminal?dir=${dir}`}
        size="sm"
      >
        Open in console
      </Button>
    </ButtonToolbar>
  );
}

function InteractiveSessionAsync({ className, job, isSelected, toggleSelected }) {
  const { data, error, loading, response } = useFetchJobInteractiveSession(job.id);

  const header = function(id) {
    return <h6
        className="d-flex flex-row align-items-center justify-content-between"
      >
      <span
        className="font-weight-bold"
        title="Desktop Session"
      >
        Interactive Session
      </span>
      <OpenDesktopButton id={id} />
    </h6>
  }

  if (response.status === 503 && data.errors[0].title  === "Wait Timeout") {
    // Resend the request if the server timeout
    return  <InteractiveSessionAsync
      className="ml-4 mb-3"
      isSelected={isSelected}
      job={job}
      toggleSelected={toggleSelected}
    />
  } else if (error) {
    return <>
      {header(null)}
      <div className={className}>
        The job did not report its interative session.
      </div>
    </>
  } else if (loading) {
    return (
      <div>
        {header(null)}
        <div className="mb-2">
          <Spinner text="Loading interactive session..." />
        </div>
      </div>
    );
  } else {
    return <InteractiveSessionChecker
      className={className}
      job={job}
      id={data.data.id}
      isSelected={isSelected}
      toggleSelected={toggleSelected}
      header={header}
    />;
  }
}

function InteractiveSessionChecker({ className, job, id, isSelected, toggleSelected, header }) {
  const { data, error, loading } = useFetchDesktop(id);
  let state = null;

  // Determine the state of the session
  if (error) {
    // flight-desktop-restapi is probably down?
    state="Unavailable"
  } else if (!data && loading) {
    // NOOP
  } else if (data.state === "Remote") {
    state = "Active";
  } else {
    state = data.state;
  }

  // Render the link or continue loading
  if (state) {
    return (
      <React.Fragment>
        {header(state === "Active" ? id : null)}
        { loading && <Loading text="Loading interactive session..." /> }
        <InteractiveSession
          className={className}
          job={job}
          id={id}
          isSelected={isSelected}
          toggleSelected={toggleSelected}
          state={state}
        />
      </React.Fragment>
    );
  } else {
    return (
      <div>
        {header(null)}
        <div className="mb-2">
          <Spinner text="Loading interactive session..." />
        </div>
      </div>
    );
  }
}

function InteractiveSession({ className, job, id, isSelected, toggleSelected, state }) {
  const session_pseudo_file = {
    id: id,
    session: true
  }
  const isActive = isSelected(session_pseudo_file)

  return (
    <ListGroup className={className}>
      <ListGroupItem
        key="desktop-session"
        action={true}
        active={isActive}
        onClick={() => toggleSelected(session_pseudo_file)}
        tag="a"
        href="#"
        // title={isViewable ? null : 'Previewing files of this type is not supported.  To view the file, you can open the results directory in the File manager.'}
      >
        <span className="d-flex flex-row align-items-center justify-content-between">
          <span>
            <i
              className={classNames("mr-2 fa fa-desktop")}
              title="VNC Session"
            ></i>
            <span
              title={id}
            >
              VNC Session
            </span>
          </span>
          <span
            className={classNames("text-small",
              isActive ? styles.FileItemActiveColor : 'text-muted'
            )}
          >
            {state}
          </span>
        </span>
      </ListGroupItem>
    </ListGroup>
  );
}

function OpenDesktopButton({ id }) {
  return (
    <ButtonToolbar>
      <Button
        color="primary"
        disabled={!id}
        href={ id ? `/desktop/sessions/${id}` : '#' }
        size="sm"
      >
        <i className="fa fa-bolt mr-1"/>
        <span>Connect to Session</span>
      </Button>
    </ButtonToolbar>
  );
}

function Loading({ text }) {
  return (
    <OverlayContainer>
      <Overlay>
        <Spinner text={text} />
      </Overlay>
    </OverlayContainer>
  );
}

export default JobOutputsCard;
