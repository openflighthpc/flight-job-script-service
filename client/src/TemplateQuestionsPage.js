import { useParams } from 'react-router-dom';
import { useRef } from 'react';

import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  Spinner,
  utils,
} from 'flight-webapp-components';

import CreateScriptButton from './CreateScriptButton';
import QuestionSet from './questions/QuestionSet';
import { useFetchQuestions } from './api';
import BackLink from "./BackLink";

const scriptNameQuestion = {
  attributes: {
    askWhen: null,
    description: "Give your script a memorable name.  You can use letters, numbers, - and _.  If you leave this field blank a name will be generated for you.",
    format: { type: "text" },
    text: "Name your script",
  },
  id: "%_script_name_%",
};

function TemplateQuestionsPage() {
  const { templateId } = useParams();
  const ref = useRef(templateId);

  const {
    data,
    error: questionsLoadingError,
    loading: questionsLoading,
  } = useFetchQuestions(ref.current);

  if (questionsLoading) {
    return <Loading />;
  } else if (questionsLoadingError) {
    if (questionsLoadingError.name === "404") {
      return (
        <>
          <BackLink link="templates"/>
          <NotFound />
        </>
      );
    } else {
      return (
        <>
          <BackLink link="templates"/>
          <DefaultErrorMessage />
        </>
      );
    }
  } else {
    const questions = utils.getResourcesFromResponse(data);
    if ( questions == null) {
      return (
        <>
          <BackLink link="templates"/>
          <DefaultErrorMessage />
        </>
      );
    } else {
      return (
        <>
          <BackLink link="templates"/>
          <QuestionSet
            questions={[...data.data, scriptNameQuestion]}
            SaveButton={(props) => <CreateScriptButton templateId={templateId} {...props} />}
          />
        </>
      );
    }
  }
}

function Loading() {
  return (
    <Layout>
      <Overlay>
        <Spinner text="Loading template questions..." />
      </Overlay>
    </Layout>
  );
}

function Layout({
  children,
  questions,
}) {
  return (
    <div>
      {children}
    </div>
  );
}

export default TemplateQuestionsPage;
