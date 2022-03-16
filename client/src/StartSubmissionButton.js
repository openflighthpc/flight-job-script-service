import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from 'reactstrap';

import QuestionSet from './questions/QuestionSet';
import SubmitScriptButton from './SubmitScriptButton';

function Disabled({ className }) {
  return (
    <Button
      className={classNames(className)}
      disabled
      size="sm"
    >
      <i className={`fa fa-rocket mr-1`}></i>
      <span>Submit</span>
    </Button>
  );
}

function StartSubmissionButton({ className, script }) {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const SaveButton = (props) => <SubmitScriptButton script={script} {...props} />;
  const modalTitle = <span>Prepare submission of <i>{script.attributes.name}</i></span>;

  return (
    <div>
      <Button
        className={className}
        color="primary"
        size="sm"
        onClick={toggle}
      >
        <i className={`fa fa-rocket mr-1`}></i>
        <span>Submit</span>
      </Button>
      <QuestionSet.ModalContainer
        SaveButton={SaveButton}
        isOpen={modal}
        modalTitle={modalTitle}
        script={script}
        toggle={toggle}
      />
    </div>
  );
}


StartSubmissionButton.Disabled = Disabled;
export default StartSubmissionButton;
