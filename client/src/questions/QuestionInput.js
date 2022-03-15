import Select from 'react-select'

function QuestionInput({ answer, onChange, question }) {
  const format = question.attributes.format;

  switch (format.type) {
    case 'multiline_text':
      return (
        <textarea
          className="w-100"
          id={question.id}
          name={question.id}
          onChange={onChange}
          placeholder={question.attributes.default}
          value={answer.value}
          onClick={() => {
            if (answer.value === "") {
              onChange({ target: { value: question.attributes.default }})
            }
          }}
          rows={10}
        />
      );
    case 'select':
    case 'multiselect':
      const options = format.options.map(option => (
        { value: option.value, label: option.text }
      ));
      const isMulti = format.type === 'multiselect';
      let defaultValue;
      if (isMulti) {
        const defaults = question.attributes.default || [];
        defaultValue = options.filter(o => defaults.includes(o.value));
      } else {
        defaultValue = options.filter(o => o.value === question.attributes.default);
      }
      let value;
      if (answer.value === "") {
        value = undefined;
      } else {
        const answeredValue = isMulti ? answer.value : [answer.value];
        value = options.filter(o => answeredValue.includes(o.value));
        value = isMulti ? value : value[0];
      }

      return (
        <Select
          key={`select-${question.id}`}
          defaultValue={isMulti ? defaultValue : defaultValue[0]}
          isMulti={isMulti}
          isClearable={isMulti}
          onChange={(selectedOption) => {
            const value = isMulti ?
              selectedOption.map(o => o.value) :
              selectedOption.value;
            onChange({target: { value: value }});
          }}
          options={options}
          value={value}
        />
      );

    case 'number':
    case 'text':
    default:
      return (
        <input
          className="w-100"
          id={question.id}
          name={question.id}
          onChange={onChange}
          placeholder={question.attributes.default}
          type={format.type || "text"}
          value={answer.value}
        />
      );
  }
}

export default QuestionInput;
