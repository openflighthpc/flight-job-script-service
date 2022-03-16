import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';
import { Link } from "react-router-dom";

import DeleteScriptButton from './DeleteScriptButton';
import StartSubmissionButton from './StartSubmissionButton';

function ScriptActions({ className, includeLink=true, onDeleted, script }) {
  const link = (
    <Link
      className="btn btn-link btn-sm"
      to={`/scripts/${script.id}`}
    >
      View script
    </Link>
  );

  return (
    <ButtonToolbar className={classNames(className)} >
      { includeLink ? link : null }
      <StartSubmissionButton
        className="mr-2"
        script={script}
      />
      <DeleteScriptButton
        onDeleted={onDeleted}
        script={script}
      />
    </ButtonToolbar>
  );
}

function DisabledActions({ className, includeLink=true }) {
  const link = (
    <Link className="btn btn-link btn-sm disabled">
      View script
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
