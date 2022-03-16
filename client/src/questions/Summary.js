import React from 'react';

function Summary({ answers, shouldAsk }) {
  const answerSummary = answers.map((answer, idx) => {
    const format = answer.question.attributes.format;
    if (shouldAsk(answer.question)) {
      let formattedAnswer;
      if (format.type === 'multiline_text') {
        formattedAnswer = <code><pre>{answer.valueOrDefault()}</pre></code>;
      } else if (format.type === 'select' || format.type === 'multiselect') {
        const isMulti = format.type === 'multiselect';
        const answeredValue = isMulti ?
          answer.valueOrDefault() :
          [answer.valueOrDefault()];
        formattedAnswer = format.options
          .filter(o => answeredValue.includes(o.value))
          .map(o => o.text);
        formattedAnswer = isMulti ? formattedAnswer.join(',') : formattedAnswer[0];

      } else {
        formattedAnswer = answer.valueOrDefault();
      }
      if (formattedAnswer == null) {
        formattedAnswer = <em>Unspecified</em>;
      }
      return (
        <React.Fragment key={idx}>
          <dt>{answer.question.attributes.text}</dt>
          <dd className="mb-3 ml-3">{formattedAnswer}</dd>
        </React.Fragment>
      );
    } else {
      return null;
    }
  });

  return (
    <dl>
      {answerSummary}
    </dl>
  );
}

export default Summary;
