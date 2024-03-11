import React, { useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  OverlayContainer,
  Spinner,
} from 'flight-webapp-components';

import JobMetadataCard from './JobMetadataCard';
import JobOutputsCard from './JobOutputsCard';
import JobSessionCard from './JobSessionCard';
import SubmissionFailureOutputCard from './SubmissionFailureOutputCard';
import { useFetchJob } from './api';
import { useInterval } from './utils';
import { useToast } from './ToastContext';
import BackLink from "./BackLink";

function JobPage() {
  const { id } = useParams();
  const { data, error, loading, get } = useFetchJob(id);
  useInterval(get, 1 * 60 * 1000);

  if (error) {
    if (error.name === "404") {
      return (
        <>
          <BackLink/>
          <NotFound/>;
        </>
      );
    } else {
      return (
        <>
          <BackLink/>
          <DefaultErrorMessage />;
        </>
      );
    }
  } else {
    const job = data == null ? null : data.data;
    return (
      <>
        <BackLink/>
        { loading && <Loading /> }
        { job != null && <LayoutContainer job={job} loading={loading} /> }
      </>
    );
  }
}

function Loading() {
  return (
    <OverlayContainer>
      <Overlay>
        <Spinner text="Loading job..."/>
      </Overlay>
    </OverlayContainer>
  );
}

function LayoutContainer({ job, loading }) {
  const { addToast } = useToast();
  const [ , forceRender ] = useState(0);
  const jobRef = useRef(job);

  if (jobRef.current == null && !loading) {
    return <DefaultErrorMessage />;
  }

  const setJob = (job) => {
    jobRef.current = job;
    forceRender();
  }
  const onCancelled = (response) => {
    setJob(response.data.data);
    if (["PENDING", "RUNNING"].includes(jobRef.current.attributes.state)) {
      addToast({
        body: (
          <div>
            Your request to cancel the job has been received
            and will be completed shortly. Please check again later.
          </div>
        ),
        icon: 'success',
        header: 'Cancellation started',
      });
    }
  };

  // Update the job reference when we periodically reload the job.
  if (job !== jobRef.current) {
    setJob(job);
  }

  return (
    <Layout
      job={jobRef.current}
      onCancelled={onCancelled}
    />
  );
}

function Layout({ job, onCancelled }) {
  const history = useHistory();
  const submissionFailed = job.attributes.submitStatus !== 0;

  return (
    <>
      <div className="wrapping-columns mb-3">
        <JobMetadataCard
          job={job}
          onCancelled={onCancelled}
          onDeleted={() => history.push('/jobs')}
        />
        <JobSessionCard
          job={job}
        />
      </div>
      {
        submissionFailed ?
          <SubmissionFailureOutputCard job={job} /> :
          <JobOutputsCard job={job} />
      }
    </>
  );
}

export default JobPage;
