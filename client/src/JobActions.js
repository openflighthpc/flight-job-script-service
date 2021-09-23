import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';

import CancelJobButton from './CancelJobButton';
import DeleteJobButton from './DeleteJobButton';

function JobActions({ className, job, onCancelled, onDeleted }) {
  const showCancel = ['PENDING', 'RUNNING'].includes(job.attributes.state);
  const showDelete = !showCancel;
  return (
    <ButtonToolbar className={classNames(className)} >
      {
        showCancel ?
          <CancelJobButton
            className="mr-2"
            job={job}
            onCancelled={onCancelled}
          /> :
          null
      }
      {
        showDelete ?
          <DeleteJobButton
            job={job}
            onDeleted={onDeleted}
          /> :
          null
      }
    </ButtonToolbar>
  );
}

export default JobActions;
