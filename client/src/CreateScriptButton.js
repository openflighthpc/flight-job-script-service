import React from 'react';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { useHistory } from "react-router-dom";

import { useGenerateScript } from './api';
import { useToast } from './ToastContext';

class ApiError extends Error { }

function CreateScriptButton({ answers, className, templateId }) {
  const { addToast } = useToast();
  const history = useHistory();
  const scriptName = answers['%_script_name_%'];
  delete answers['%_script_name_%'];
  const { loading, post, response } = useGenerateScript(templateId, answers, scriptName);

  const submit = async () => {
    try {
      await post();
      if (response.ok) {
        const script = ( await response.json() ).data;
        history.push(`/scripts/${script.id}`);
      } else if (response.status === 409) {
        throw new ApiError(`The script name "${scriptName}" is already taken.`);
      } else if (response.status === 422) {
        throw new ApiError(await response.text());
      } else {
        throw new ApiError();
      }
    } catch (e) {
      let body;
      if (e.constructor === ApiError) {
        body = e.message;
      }
      addToast({
        body: body || (
          <div>
            Unfortunately there has been a problem rendering your job
            script.  Please try again and, if problems persist, help us to
            more quickly rectify the problem by contacting us and letting us
            know.
          </div>
        ),
        icon: 'danger',
        header: 'Failed to render template',
      });
    }
  }

  const buttonText = loading ? 'Saving...' : 'Save job script';

  return (
    <React.Fragment>
      <Button
        color="primary"
        onClick={submit}
        className={classNames(className, { 'disabled': loading })}
        disabled={loading}
      >
        <i className="fa fa-save mr-1" />
        {buttonText}
      </Button>
    </React.Fragment>
  );
}

export default CreateScriptButton;
