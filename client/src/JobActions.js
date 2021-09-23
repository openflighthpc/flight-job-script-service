import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';

import CancelJobButton from './CancelJobButton';
import DeleteJobButton from './DeleteJobButton';

function JobActions({ className, job, onCancelled, onDeleted }) {
  return (
    <ButtonToolbar className={classNames(className)} >
      <CancelJobButton
        className="mr-2"
        job={job}
        onCancelled={onCancelled}
      />
      <DeleteJobButton
        job={job}
        onDeleted={onDeleted}
      />
    </ButtonToolbar>
  );
}

export default JobActions;
