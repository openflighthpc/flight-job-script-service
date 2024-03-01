import { Col, Row } from 'reactstrap';
import {Link, useHistory, useParams} from 'react-router-dom';
import { useRef } from 'react';

import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  Spinner,
} from 'flight-webapp-components';

import ScriptContentCard from './ScriptContentCard';
import ScriptMetadataCard from './ScriptCard';
import ScriptNotesCard from './ScriptNotesCard';
import { useFetchScript } from './api';
import BackLink from "./BackLink";

function ScriptPage() {
  const { id } = useParams();
  const history = useHistory();
  const ref = useRef(id);
  const { data, error, loading } = useFetchScript(ref.current);

  if (loading) {
    return <Loading id={ref.current} />;
  } else if (error) {
    if (error.name === "404") {
      return (
        <>
          <BackLink link="scripts"/>
          <NotFound/>
        </>
      );
    } else {
      return (
        <>
          <BackLink link="scripts"/>
          <DefaultErrorMessage/>
        </>
      );
    }
  } else {
    const script = data.data;
    if ( script == null) {
      return (
        <>
          <BackLink link="scripts"/>
          <DefaultErrorMessage/>
        </>
      );
    } else {
      return (
        <>
          <BackLink link="scripts"/>
          <div className="d-flex mb-3">
            <ScriptMetadataCard
              className="mr-3 w-50"
              script={script}
              onDeleted={() => history.push('/scripts')}
            />
            <ScriptNotesCard
              className="w-50"
              script={script} />
          </div>
          <ScriptContentCard className="my-4" script={script} />
        </>
      );
    }
  }
}

function Loading({ id }) {
  return (
    <Overlay>
      <Spinner text="Loading script..." />
    </Overlay>
  );
}

export default ScriptPage;
