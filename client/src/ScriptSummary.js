import ReactMarkdown from 'react-markdown'

import { DefaultErrorMessage, Spinner, utils } from 'flight-webapp-components';

import ScriptActions from './ScriptActions';
import {useFetchScriptNotes} from './api';

function getNoteFromResponse(data) {
  if (!utils.isObject(data)) { return null; }
  if (!utils.isObject(data.data)) { return null; }
  if (!utils.isObject(data.data.attributes)) { return null; }
  return data.data.attributes.payload;
}

function ScriptSummary({ reloadScripts, script }) {
  const header = script == null ?
    <h4 className="mb-0"> </h4> :
    <h4 className="mb-0">{script.id}</h4>;
  const actions = script == null ?
    null :
    <ScriptActions
      className="mt-4"
      onDeleted={reloadScripts}
      script={script}
    />;

  return (
    <div className="card">
      {
        script == null ? null :
          <div className="card-header d-flex flex-row justify-content-between">
            {header}
          </div>
      }
      <div className="card-body">
        {
          script == null ?
            "Select a script from the table to view its notes." :
            <RenderedNotesForScript script={script} />
        }
        {actions}
      </div>
    </div>
  );
}

export function RenderedNotesForScript({ script }) {
  if (script.note == null) {
    return <RenderedAsyncNotesForScript script={script} />;
  }

  return <RenderedNotes notes={script.note.attributes.payload} />;
}

export function RenderedAsyncNotesForScript({ script }) {
  const { data, error, loading } = useFetchScriptNotes(script);
  if (loading) {
    return <Spinner center="none" text="Loading script notes..."/>;
  }
  if (error) {
    return <DefaultErrorMessage />;
  }

  return <RenderedNotes notes={getNoteFromResponse(data)} />;
}

export function RenderedNotes({ notes }) {
  if (notes == null || notes === "") {
    return <em>The selected script does not have any notes.</em>;
  }
  return (
    <div>
      <ReactMarkdown>{notes}</ReactMarkdown>
    </div>
  );
}

export function ScriptNotesPlaceholder() {
  return (
    <div>
      Select a script from the table to view its notes.
    </div>
  );
};

export default ScriptSummary;
