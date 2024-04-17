import React from 'react';

import {
  DefaultErrorMessage,
  Overlay,
  OverlayContainer,
  Spinner,
  UnauthorizedError,
  useMediaGrouping,
  utils,
} from 'flight-webapp-components';

import TemplateCard from './TemplateCard';
import { useFetchTemplates } from './api';
import BackLink from "./BackLink";

function TemplatesPage() {
  const { data, error, loading } = useFetchTemplates();

  if (error) {
    if (utils.errorCode(data) === 'Unauthorized') {
      return (
        <>
          <BackLink link="scripts"/>
          <UnauthorizedError />
        </>
      );
    } else {
      return (
        <>
          <BackLink link="scripts"/>
          <DefaultErrorMessage />
        </>
      );
    }
  } else {
    const templates = utils.getResourcesFromResponse(data);
    return (
      <>
        <BackLink link="scripts"/>
        {
          loading && (
            <OverlayContainer>
              <Overlay>
                <Spinner text="Loading templates..."/>
              </Overlay>
            </OverlayContainer>
          )
        }
        <TemplateCardDeck templates={templates || []} />
      </>
    );
  }
}

function TemplateCardDeck({ templates }) {
  const { groupedItems: groupedTemplates } = useGrouping(templates);
  const decks = groupedTemplates.map(
    (group, index) => (
      <div key={index} className="card-deck mb-4">
        {
          group.map((template) => {
            if (template == null) {
              // The `key` attribute is intentionally omitted.
              return <BlankCard />;
            } else {
            return <TemplateCard key={template.id} template={template} />;
            }
          })
        }
      </div>
    )
  );

  return (
    <>
      <p className="tagline centered-tagline mb-5">
        Create a job script by selecting a template from the options below.
      </p>
      {decks}
    </>
  );
}

function useGrouping(templates) {
  const { groupedItems, perGroup } = useMediaGrouping(
    ['(min-width: 1200px)', '(min-width: 992px)', '(min-width: 768px)', '(min-width: 576px)'],
    [2, 2, 1, 1],
    1,
    templates,
  );
  if (groupedItems.length) {
    const lastGroup = groupedItems[groupedItems.length - 1];
    if (lastGroup.length < perGroup) {
      const requiredBlanks = perGroup - lastGroup.length;
      for (let i=0; i<requiredBlanks; i++) {
        lastGroup.push(null);
      }
    }
  }
  return { groupedItems, perGroup };
}

function BlankCard() {
  return <div className="card invisible"></div>;
}

export default TemplatesPage;
