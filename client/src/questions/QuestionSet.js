import React from 'react';
import ReactMarkdown from 'react-markdown'
import { Button } from 'reactstrap';

import Layout from "./Layout";
import QuestionInput from "./QuestionInput";
import ModalContainer from "./ModalContainer";
import Summary from "./Summary";
import useQuestionSet from "./useQuestionSet";

function QuestionSet({ LayoutComponent=Layout, questions, SaveButton }) {
  const qs = useQuestionSet(questions);

  if (qs.allAsked) {
    const { answers, flattenedAnswers, onPrevious, shouldAsk } = qs;
    const leftButton = (
      <Button
        className="button link cancel-button blue-text mr-2"
        onClick={onPrevious}
      >
        <span>Back</span>
      </Button>
    );
    const rightButton = (
      <SaveButton
        answers={flattenedAnswers}
      />
    );

    return (
      <LayoutComponent
        leftButton={leftButton}
        rightButton={rightButton}
        title="Summary"
      >
        <Summary answers={answers} shouldAsk={shouldAsk} />
      </LayoutComponent>
    );

  } else {
    const {
      currentAnswer,
      currentQuestion,
      isFirstQuestion,
      isLastQuestion,
      onChange,
      onNext,
      onPrevious,
    } = qs;

    const leftButton = isFirstQuestion ?
      null :
      (
        <Button
          className="button link cancel-button blue-text mr-2"
          onClick={onPrevious}
        >
          <span>Back</span>
        </Button>
      );
    const rightButton = (
      <Button
        className="button link white-text"
        onClick={onNext}
      >
        <span>{ isLastQuestion ? 'Finish' : 'Next' }</span>
      </Button>
    );

    return (
      <LayoutComponent
        leftButton={leftButton}
        rightButton={rightButton}
        title={currentQuestion.attributes.text}
      >
        <ReactMarkdown>{currentQuestion.attributes.description}</ReactMarkdown>
        <QuestionInput
          answer={currentAnswer}
          onChange={onChange}
          question={currentQuestion}
        />
      </LayoutComponent>
    );
  }
}

QuestionSet.ModalContainer = ModalContainer;
export default QuestionSet;
