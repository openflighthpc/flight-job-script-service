import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  Spinner,
  utils,
} from 'flight-webapp-components';

import QuestionSet from './QuestionSet';
import { useFetchSubmissionQuestions } from '../api';

function ModalContainer({
  SaveButton,
  className,
  isOpen,
  script,
  size="lg",
  modalTitle,
  toggle,
}) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={className}
      size={size}
    >
      <DelayedModalContent
        SaveButton={SaveButton}
        toggle={toggle}
        modalTitle={modalTitle}
        script={script}
      />
    </Modal>
  );
}

function DelayedModalContent({ SaveButton, toggle, modalTitle, script }) {
  const { data, error, loading } = useFetchSubmissionQuestions(script.id);
  let body = null;

  if (loading) {
    body = <Loading />;
  } else if (error && error.name === "404") {
    body = <NotFound />;
  } else if (error) {
    body = <DefaultErrorMessage />;
  } else if (utils.getResourcesFromResponse(data) == null) {
    body = <DefaultErrorMessage />;
  }

  if (body) {
    // `body` has been set.  We don't have the questions loaded.
    return (
      <ModalContent toggle={toggle} modalTitle={modalTitle}>{body}</ModalContent>
    );
  }

  // If we've got this far we have the questions.  We can render the question
  // set.
  const questions = utils.getResourcesFromResponse(data);
  return (
    <QuestionSet
      LayoutComponent={(props) => <ModalContent modalTitle={modalTitle} toggle={toggle} {...props} />}
      SaveButton={SaveButton}
      questions={questions}
    />
  );
}

function ModalContent({
  children,
  leftButton,
  modalTitle,
  rightButton,
  title,
  toggle,
}) {
  return (
    <React.Fragment>
      <ModalHeader toggle={toggle} title={modalTitle}>
        {modalTitle}
      </ModalHeader>
      <ModalBody>
        <h4 className="text-truncate" title={title} >
          {title}
        </h4>
        {children}
      </ModalBody>
      <ModalFooter>
        {leftButton}
        {rightButton}
      </ModalFooter>
    </React.Fragment>
  );
}

function Loading() {
  return (
    <Overlay>
      <Spinner text="Loading questions..." />
    </Overlay>
  );
}

export default ModalContainer;
