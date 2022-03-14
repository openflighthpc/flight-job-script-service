import { useParams } from 'react-router-dom';

import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  Spinner,
  utils,
} from 'flight-webapp-components';

import SubmitScriptButton from './SubmitScriptButton';
import QuestionSet from './questions/QuestionSet';
import { useFetchSubmissionQuestions } from './api';

function ScriptSubmissionPage() {
  const { scriptId } = useParams();
  const {
    data,
    error: questionsLoadingError,
    loading: questionsLoading,
  } = useFetchSubmissionQuestions(scriptId);

  if (questionsLoading) {
    return <Loading />;
  } else if (questionsLoadingError) {
    if (questionsLoadingError.name === "404") {
      return <NotFound />;
    } else {
      return <DefaultErrorMessage />;
    }
  } else {
    const questions = utils.getResourcesFromResponse(data);
    if ( questions == null) {
      return <DefaultErrorMessage />;
    } else {
      return (
        <QuestionSet
          templateId={scriptId}
          questions={data.data}
          SaveButton={(props) => <SubmitScriptButton scriptId={scriptId} {...props} />}
        />
      );
    }
  }
}

function Loading() {
  return (
    <Layout>
      <Overlay>
        <Spinner text="Loading questions..." />
      </Overlay>
    </Layout>
  );
}

function Layout({ children, questions }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default ScriptSubmissionPage;
