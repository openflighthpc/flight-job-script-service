import { useState } from 'react';

import { RenderedNotes } from './ScriptSummary';
import { ScriptNotesEditor } from './ScriptEditor';
import { useSaveScriptNotes } from './api';
import { useToast } from './ToastContext';
import {Link} from "react-router-dom";

function buildNotesResource(id, newNotes) {
  return {
    data: {
      type: 'notes',
      id: id,
      attributes: {
        payload: newNotes,
      }
    }
  };
}

function ScriptNotesCard({ className, script }) {
  const [notes, setNotes] = useState(script.note);
  const [editing, setEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(notes.attributes.payload);
  const { loading: saving, patch, response } = useSaveScriptNotes(notes);
  const { addToast } = useToast();

  const saveNotes = async () => {
    try {
      await patch(buildNotesResource(notes.id, editorContent));
      if (response.ok) {
        const noteResource = (await response.json()).data;
        setNotes(noteResource);
        setEditing(false);
      } else {
        throw new Error();
      }
    } catch (e) {
      addToast(saveFailedToast());
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header d-flex flex-row justify-content-between">
        <h4 className="mb-0">Notes</h4>
        <EditSaveButton
          editing={editing}
          onEdit={() => setEditing(true)}
          onSave={() => saveNotes()}
          saving={saving}
        />
      </div>
      <div className="card-body">
        {
          editing ?
            <ScriptNotesEditor
              focus={editing}
              name={`${script.id}-notes`}
              onChange={setEditorContent}
              readOnly={saving}
              value={editorContent}
            /> :
            <RenderedNotes notes={notes.attributes.payload} />
        }
      </div>
    </div>
  );
}

function EditSaveButton({ editing, onEdit, onSave, saving }) {
  const icon = editing ? saving ? 'fa-spinner fa-spin' : 'fa-save' : 'fa-edit';

  return (
    <Link
      className="link blue-text"
      disabled={saving}
      onClick={editing ? onSave : onEdit}
    >
      <h4 className="mb-0">
        <i className={`fa ${icon}`}></i>
      </h4>
    </Link>
  );

}

function saveFailedToast() {
  let body = (
    <div>
      Unfortunately there has been a problem updating your script.  Please try
      again and, if problems persist, help us to more quickly rectify the
      problem by contacting us and letting us know.
    </div>
  );

  return {
    body,
    icon: 'danger',
    header: 'Failed to update script',
  };
}

export default ScriptNotesCard;
