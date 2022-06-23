import { Link } from 'react-router-dom';

import MetadataEntry from './MetadataEntry';
import ScriptActions from './ScriptActions';
import TimeAgo from './TimeAgo';
import { ScriptTypeBadge } from './JobStateBadges';

function ScriptMetadataCard({ onDeleted, script }) {
  return (
    <div className="card">
      <div className="card-header d-flex flex-row justify-content-between">
        <h4
          className="text-truncate mb-0"
          title={script.attributes.name}
        >
          {script.attributes.name}
        </h4>
        <ScriptActions
          className="h-100"
          includeLink={false}
          onDeleted={onDeleted}
          script={script}
        />
      </div>
      <div className="card-body">
        <dl>
          <MetadataEntry
            format={(value) => <code>{value}</code>}
            name="ID"
            value={script.id}
          />
          <MetadataEntry
            format={(value) => <ScriptTypeBadge script={script} />}
            name="Type"
            value={script.tags}
          />
          <MetadataEntry
            name="Template"
            value={script.template ? script.template.attributes.name : null}
            format={(value) => (
              value == null ? (
                <span className="text-warning mr-1" title="Template is unknown">
                  {script.template.id}
                  <i className="fa fa-exclamation-triangle ml-1"></i>
                </span>
              ) : (
                <Link
                  to={`/templates/${script.template.id}`}
                  title="View template"
                >
                  {value}
                </Link>
              )
            )}
          />
          <MetadataEntry
            name="Created"
            value={script.attributes.createdAt}
            format={(value) => <TimeAgo date={value} />}
          />
          <MetadataEntry
            format={(value) => <code>{value}</code>}
            name="Located at"
            value={script.attributes.path}
          />
        </dl>
      </div>
    </div>
  );
}

export default ScriptMetadataCard;
