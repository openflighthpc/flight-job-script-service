import classNames from 'classnames';
import { Badge } from 'reactstrap';
import { Link } from 'react-router-dom';

import MetadataEntry from './MetadataEntry';
import TimeAgo from './TimeAgo';
import { stateColourMap } from './utils';

function endTimeNameFromState(state) {
  if (state === 'CANCELLED') {
    return 'Cancelled';
  } else if (state === 'FAILED' || state === 'TERMINATED') {
    return 'Failed';
  } else {
    return 'Completed';
  }
}

function JobMetadataCard({ job }) {
  const jobState = job.attributes.state;
  const colour = stateColourMap[jobState];

  return (
    <div
      className={classNames("card", `border-${colour}`)}
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
            value={job.attributes.schedulerId}
            format={(value) => (
              value == null ? <span>&mdash;</span> : <code>{value}</code>
            )}
          />
          <MetadataEntry
            format={(value) => <Badge color={colour}>{value}</Badge>}
            name="State"
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
            value={job.attributes.createdAt}
            format={(value) => <TimeAgo date={value} />}
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name="Started"
            value={job.attributes.startTime}
          />
          <MetadataEntry
            format={(value) => <TimeAgo date={value} />}
            hideWhenNull
            name={endTimeNameFromState(jobState)}
            value={job.attributes.endTime}
          />
        </dl>
      </div>
    </div>
  );
}

export default JobMetadataCard;