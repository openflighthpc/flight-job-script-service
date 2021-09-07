import classNames from 'classnames';
import { useState } from 'react';
import { Button, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';

import MetadataEntry from './MetadataEntry';
import TimeAgo from './TimeAgo';
import { stateColourMap } from './utils';
import JobStateBadges from './JobStateBadges';

import { useCancelJob } from './api';

function endTimeNameFromState(state) {
  if (state === 'CANCELLED') {
    return 'Cancelled';
  } else if (state === 'FAILED') {
    return 'Failed';
  } else {
    return 'Completed';
  }
}

function JobMetadataCard({ className, job }) {
  const [jobAttributes, setJobAttributes] = useState(job.attributes);

  const jobState = jobAttributes.state
  const colour = stateColourMap[jobState];

  return (
    <div
      className={classNames("card", `border-${colour}`, className)}
    >
      <h4
        className="card-header text-truncate justify-content-between d-flex align-items-end"
        title={job.script ? job.script.attributes.name : 'Unknown'}
      >
        <span>
          Job <code>{job.id}</code>
        </span>
        <span>
          <Badge color={colour}>{jobState}</Badge>
          <CancelButton
            id={job.id}
            jobAttributes={jobAttributes}
            setJobAttributes={setJobAttributes}
          />
        </span>
      </h4>
      <div className="card-body">
        <dl>
          <MetadataEntry
            format={(value) => <code>{value}</code>}
            name="ID"
            value={job.id}
          />
          <MetadataEntry
            name="Scheduler ID"
            value={jobAttributes.schedulerId}
            format={(value) => (
              value == null ? <span>&mdash;</span> : <code>{value}</code>
            )}
          />
          <MetadataEntry
            format={(_) => <JobStateBadges job={job} />}
            name="State / Type"
            value={jobState}
          />
          <MetadataEntry
            hideWhenNull
            name="Reason"
            value={jobAttributes.reason}
          />
          <MetadataEntry
            name="Script"
            value={job.script ? job.script.attributes.name : null}
            format={(value) => (
              value == null ? <i>Unknown</i> : (
                <Link
                  to={`/scripts/${job.script.id}`}
                  title="View script"
                >
                  {value}
                </Link>
              )
            )}
          />
          <MetadataEntry
            name="Submitted"
            value={jobAttributes.createdAt}
            format={(value) => <TimeAgo date={value} />}
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name="Started"
            value={jobAttributes.startTime}
          />
          <EstimatedTime
            jobAttributes={jobAttributes}
            estimated={jobAttributes.estimatedStartTime}
            known={jobAttributes.startTime}
            name="Starts"
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name={endTimeNameFromState(jobState)}
            value={jobAttributes.endTime}
          />
          <EstimatedTime
            estimated={jobAttributes.estimatedEndTime}
            jobAttributes={jobAttributes}
            known={jobAttributes.endTime}
            name="Completes"
          />
        </dl>
      </div>
    </div>
  );
}

function EstimatedTime({estimated, jobAttributes, known, name}) {
  let unknown_estimate = "currently unknown";
  if (jobAttributes.state === 'FAILED' || jobAttributes.state === 'UNKNOWN') {
    unknown_estimate = 'N/A';
  }

  return (
    <MetadataEntry
      format={
        (value) => value === unknown_estimate ?
          <em>{value}</em> :
          <>
            <TimeAgo date={value} />
            <Badge className="ml-1" color="warning" pill>Estimated</Badge>
          </>
      }
      hide={known != null}
      name={name}
      value={estimated == null ? unknown_estimate : estimated}
    />
  );
}

function CancelButton({id, jobAttributes, setJobAttributes}) {
  const { loading, patch, response } = useCancelJob(id)

  if (["PENDING", "RUNNING"].includes(jobAttributes.state)) {
    const cancel = async() => {
      await patch();
      if (response.ok) {
        setJobAttributes(response.data.data.attributes);
      } else {
        console.log("Failed to cancel job");
      }
    }

    const icon = loading ? 'fa-spin fa-spinner' : 'fa-ban'

    return (
      <Button
        color="danger"
        onClick={cancel}
        className={classNames('ml-2', { 'disabled': loading })}
        disabled={loading}
        size="sm"
      >
        <i className={`fa ${icon} mr-1`}></i>
        <span>Cancel</span>
      </Button>
    );
  } else {
    return <></>;
  }
}

export default JobMetadataCard;
