import { useParams } from 'react-router-dom';
import { useRef } from 'react';

import {
  DefaultErrorMessage,
  NotFound,
  Overlay,
  Spinner,
} from 'flight-webapp-components';

import TemplateCard from './TemplateCard';
import { useFetchTemplate } from './api';
import BackLink from "./BackLink";

function TemplatePage() {
  const { id } = useParams();
  const ref = useRef(id);
  const { data, error, loading } = useFetchTemplate(ref.current);

  if (loading) {
    return <Loading id={ref.current} />;
  } else if (error) {
    if (error.name === "404") {
      return (
        <>
          <BackLink link="templates"/>
          <NotFound />;
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
    const template = data.data;
    if ( template == null) {
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
          <TemplateCard template={template} />
        </>
      );
    }
  }
}

function Loading({ id }) {
  return (
    <Overlay>
      <Spinner text="Loading template..." />
    </Overlay>
  );
}

export default TemplatePage;
