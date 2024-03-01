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

import JobsTable from './JobsTable';
import styles from './index.module.css';
import { useFetchJobs } from './api';
import { useInterval } from './utils';

function JobsPage() {
  const { data, error, loading, get } = useFetchJobs();
  useInterval(get, 1 * 60 * 1000);

  if (error) {
    if (utils.errorCode(data) === 'Unauthorized') {
      return <UnauthorizedError />;
    } else {
      return <DefaultErrorMessage />;
    }
  } else {
    const jobs = data == null ? null : data.data ;
    return (
      <React.Fragment>
        { loading && <Loading /> }
        { jobs != null && <Layout reloadJobs={get} jobs={jobs} /> }
      </React.Fragment>
    );
  }
}

function Loading() {
  return (
    <OverlayContainer>
      <Overlay>
        <Spinner text="Loading jobs..."/>
      </Overlay>
    </OverlayContainer>
  );
}

function Layout({ reloadJobs, jobs }) {
  if (jobs == null || !jobs.length) {
    return <NoJobsFound />;
  }

  return (
    <>
      <InfoRow jobs={jobs} />
      <JobsTable reloadJobs={reloadJobs} jobs={jobs} />
    </>
  );
}

function InfoRow({ jobs }) {
  const jobOrjobs = jobs.length === 1 ? 'job' : 'jobs';

  return (
    <div className={`row justify-content-between align-items-center mb-5 w-100`}>
      <span className={`tagline mb-0`}>
        You have {jobs.length} {jobOrjobs}.
      </span>
      <div className="d-flex">
        <NewJobButton/>
      </div>
    </div>
  );
}

function NewJobButton() {
  return (
    <>
      <Link
        className="button link white-text"
        to="/scripts"
      >
        <i className="fa fa-plus mr-3"></i>
        NEW JOB
      </Link>
    </>
  );
}

function NoJobsFound() {
  return (
    <div>
      <p>
        No jobs found.
      </p>
      <NewJobButton/>
    </div>
  );
}

export default JobsPage;
