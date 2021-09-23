import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';

import CancelJobButton from './CancelJobButton';

function JobActions({ className, job, onCancel, onCancelled }) {
  return (
    <ButtonToolbar className={classNames(className)} >
      <CancelJobButton
        job={job}
        onCancel={onCancel}
        onCancelled={onCancelled}
      />
    </ButtonToolbar>
  );
}

export default JobActions;
