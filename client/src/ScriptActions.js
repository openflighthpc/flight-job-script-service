import classNames from 'classnames';
import { ButtonToolbar } from 'reactstrap';
import { Link } from "react-router-dom";

import DeleteScriptButton from './DeleteScriptButton';

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
      <SubmitLink
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

function SubmitLink({ className, script }) {
  return (
    <Link
      className={classNames("btn btn-primary btn-sm", className)}
      to={`/scripts/submit/${script.id}`}
    >
      <i className={`fa fa-rocket mr-1`}></i>
      <span>Submit</span>
    </Link>
  );
}

SubmitLink.Disabled = function({ className }) {
  return (
    <Link
      className={classNames("btn btn-secondary btn-sm disabled", className)}
      to={""}
    >
      <i className={`fa fa-rocket mr-1`}></i>
      <span>Submit</span>
    </Link>
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
      <SubmitLink.Disabled className="mr-2" />
      <DeleteScriptButton.Disabled />
    </ButtonToolbar>
  );
}

ScriptActions.Disabled = DisabledActions;
export default ScriptActions;
