import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';
import { Link } from "react-router-dom";

import DeleteScriptButton from './DeleteScriptButton';
import StartSubmissionButton from './StartSubmissionButton';

function ScriptActions({ className, includeLink=true, onDeleted, script }) {
  const link = (
    <Link
      className="button link white-text mr-2"
      to={`/scripts/${script.id}`}
    >
      <span>View</span>
    </Link>
  );

  return (
    <div
      className={`d-flex justify-content-center ${classNames(className)}`}
    >
      { includeLink ? link : null }
      <StartSubmissionButton
        className="mr-2"
        script={script}
      />
      <DeleteScriptButton
        onDeleted={onDeleted}
        script={script}
      />
    </div>
  );
}

function DisabledActions({ className, includeLink=true }) {
  const link = (
    <Link className="button link white-text disabled mr-2">
      View
    </Link>
  );

  return (
    <ButtonToolbar className={classNames(className)} >
      { includeLink ? link : null }
      <StartSubmissionButton.Disabled className="mr-2" />
      <DeleteScriptButton.Disabled />
    </ButtonToolbar>
  );
}

ScriptActions.Disabled = DisabledActions;
export default ScriptActions;
