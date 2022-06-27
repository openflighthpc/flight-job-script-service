import classNames from 'classnames';
import { Badge } from 'reactstrap';
import { Link } from 'react-router-dom';

import JobActions from './JobActions';
import JobStateBadges from './JobStateBadges';
import MetadataEntry from './MetadataEntry';
import TimeAgo from './TimeAgo';
import { stateColourMap } from './utils';

function endTimeNameFromState(state) {
  if (state === 'CANCELLED') {
    return 'Cancelled';
  } else if (state === 'FAILED') {
    return 'Failed';
  } else {
    return 'Completed';
  }
}

function JobMetadataCard({ className, job, onCancelled, onDeleted }) {
  const jobState = job.attributes.state
  const colour = stateColourMap[jobState];

  return (
    <div
      className={classNames("card", `border-${colour}`, className)}
    >
      <div className="card-header d-flex flex-row justify-content-between">
        <h4
          className="text-truncate mb-0"
          title={job.script ? job.script.attributes.name : 'Unknown'}
        >
          <span>
            Job <code>{job.id}</code>
          </span>
          <Badge className="ml-2" color={colour}>{jobState}</Badge>
        </h4>
        <JobActions
          job={job}
          onCancelled={onCancelled}
          onDeleted={onDeleted}
        />
      </div>
      <div className="card-body">
        <dl>
          <MetadataEntry
            format={(value) => <code>{value}</code>}
            name="ID"
            value={job.id}
          />
          <MetadataEntry
            name="Scheduler ID"
            value={job.attributes.schedulerId}
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
            value={job.attributes.reason}
          />
          <MetadataEntry
            name="Script"
            value={job.script ? job.script.attributes.name : null}
            format={(value) => (
              value == null ? (
                <span className="text-warning mr-1" title="Script is unknown">
                  {job.attributes.scriptId}
                  <i className="fa fa-exclamation-triangle ml-1"></i>
                </span>
              ) : (
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
            value={job.attributes.createdAt}
            format={(value) => <TimeAgo date={value} />}
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name="Started"
            value={job.attributes.startTime}
          />
          <EstimatedTime
            job={job}
            estimated={job.attributes.estimatedStartTime}
            known={job.attributes.startTime}
            name="Starts"
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name={endTimeNameFromState(jobState)}
            value={job.attributes.endTime}
          />
          <EstimatedTime
            estimated={job.attributes.estimatedEndTime}
            job={job}
            known={job.attributes.endTime}
            name="Completes"
          />
        </dl>
      </div>
    </div>
  );
}

function EstimatedTime({estimated, job, known, name}) {
  let unknown_estimate = "currently unknown";
  if (['FAILED', 'UNKNOWN', 'CANCELLED'].includes(job.attributes.state)) {
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

export default JobMetadataCard;
