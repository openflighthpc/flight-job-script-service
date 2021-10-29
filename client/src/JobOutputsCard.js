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
} from './api';
import { useInterval } from './utils';

export function getResourceFromResponse(data) {
  if (!utils.isObject(data)) { return null; }
  return data.data;
}

function JobOutputsCard({ job }) {
  const [selected, setSelected] = useState(null);

  function toggleSelected(file) {
    selected === file ? setSelected(null) : setSelected(file)
  }
  function isSelected(file) {
    return selected != null && selected.id === file.id;
  }

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
          hasFiles ?
            (
              <>
              <hr/>
              <FilePreview job={job} selected={selected} />
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
      className={classNames({
        [styles.FileItemNonViewable]: !isViewable,
        [styles.FileItemViewable]: isViewable,
      })}
      key={file.attributes.filename}
      active={isActive}
      action={isViewable}
      onClick={() => isViewable && toggleSelected(file)}
      tag="a"
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

  const isTaskFiles = job.attributes.stdoutPath == null &&
    job.attributes.stderrPath == null;
  const isStdErrFile = (file) => file.id === `${job.id}.stderr`;

  return (
    <ListGroup className={classNames(styles.OutputListing, className)}>
      {
        files.map(file => {
          let name;
          if (isTaskFiles) {
            const [taskId, type] = file.id.replace(`${job.id}.`, '').split('.');
            name = type === 'stdout' ?
              `Task ${taskId} standard output` :
              `Task ${taskId} standard error`;
          } else {
            name =isStdErrFile(file) ?
              'Standard error' :
              mergedStderr ?
              'Standard output and error' :
              'Standard output';
          }

          return (
            <FileItem
              key={file.id}
              file={file}
              isSelected={isSelected}
              name={name}
              toggleSelected={toggleSelected}
            />
          );
      })
}
    </ListGroup>
  );
}

function ResultsListingAsync({ className, isSelected, job, toggleSelected }) {
  const { data, error, loading, get } = useFetchResultFiles(job.id);
  useInterval(get, 1 * 60 * 1000);

  if (error) {
    return (
      <div className={className}>
        The job did not report its results directory.
      </div>
    );
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
    return (
      <div className={className}>
        The job did not report its results directory.
      </div>
    );
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

function FilePreview({selected, job}) {
  if (selected == null) {
    return (
      <div>
        <em>Select a text file above to preview its output.</em>
      </div>
    );
  }

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
        <i className="fa fa-file-o mr-1"/>
        <span>Open in file manager</span>
      </Button>
      <Button
        color="primary"
        href={`/console/terminal?dir=${dir}`}
        size="sm"
      >
        <i className="fa fa-terminal mr-1"/>
        <span>Open in console</span>
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
