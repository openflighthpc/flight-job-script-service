import { useReducer } from 'react';

function shouldAsk(state) {
  return function(question) {
    const ask_when = question.attributes.askWhen;
    if (ask_when == null) { return true; }

    // `ask_when` is of the format
    //
    // {
    //   value: `question.<question id>.answer`,
    //   eq: <dependency value>,
    // }
    //
    // This is the only format currently supported: checking an answer to a
    // question for equality against a given value.

    const qId = ask_when.value.split('.')[1];
    const dependency = state.answers.find(a => a.question.id === qId);
    return ask_when.eq === dependency.valueOrDefault();
  }
}

function initialState(questions) {
  return {
    answers: questions.map(q => ({
      question: q,
      value: "",
      valueOrDefault() {
        return this.value === "" ? this.question.attributes.default : this.value;
      },
      valueOrNull() {
        return this.value === "" ? null : this.value;
      },
    })),
    currentQuestion: 0,
  };
}

function reducer(state, action) {
  let nqi; // Next question index.

  switch (action.type) {
    case 'change':
      return {
        ...state,
        answers: [
          ...state.answers.slice(0, state.currentQuestion),
          {
            ...state.answers[state.currentQuestion],
            value: action.value,
          },
          ...state.answers.slice(state.currentQuestion + 1),
        ]
      };
    case 'next':
      nqi = state.currentQuestion + 1;
      for (; nqi < state.answers.length; nqi++) {
        let candidateQuestion = state.answers[nqi].question;
        if (shouldAsk(state)(candidateQuestion)) {
          break;
        }
      }
      return { ...state, currentQuestion: nqi };
    case 'previous':
      nqi = state.currentQuestion - 1;
      for (; nqi >= 0; nqi--) {
        let candidateQuestion = state.answers[nqi].question;
        if (shouldAsk(state)(candidateQuestion)) {
          break;
        }
      }
      return { ...state, currentQuestion: nqi };
    default:
      return state;
  }
}

function useQuestionSet(questions) {
  const [state, dispatch] = useReducer(reducer, initialState(questions));

  const onPrevious = () => dispatch({ type: 'previous' });

  if (state.currentQuestion < questions.length) {
    // There are questions that still need to be asked.
    const currentAnswer = state.answers[state.currentQuestion];
    const currentQuestion = currentAnswer.question;
    const isFirstQuestion = state.currentQuestion === 0;
    const isLastQuestion = state.currentQuestion === questions.length - 1;
    const onChange = (ev) => {
      let value;
      if (ev.target.type === "number") {
        value = ev.target.valueAsNumber;
      } else {
        value = ev.target.value;
      }
      return dispatch({ type: 'change', value: value });
    };
    const onNext = () => dispatch({ type: 'next' });

    return {
      allAsked: false,
      currentAnswer,
      currentQuestion,
      isFirstQuestion,
      isLastQuestion,
      onChange,
      onNext,
      onPrevious,
    };
  } else {
    // All questions have been asked.
    const flattenedAnswers = state.answers.reduce((accum, answer) => {
      if (shouldAsk(state)(answer.question)) {
        if (answer.valueOrNull() != null) {
          accum[answer.question.id] = answer.valueOrNull();
        }
      }
      return accum;
    }, {});

    return {
      allAsked: true,
      answers: state.answers,
      flattenedAnswers: flattenedAnswers,
      onPrevious,
      shouldAsk: shouldAsk(state),
    };
  }
}

export default useQuestionSet;
