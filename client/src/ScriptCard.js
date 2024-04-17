import { Link } from 'react-router-dom';

import MetadataEntry from './MetadataEntry';
import ScriptActions from './ScriptActions';
import TimeAgo from './TimeAgo';
import { ScriptTypeBadge } from './JobStateBadges';

function ScriptMetadataCard({ className, onDeleted, script }) {
  return (
    <div className={`card ${className}`}>
      <div className="card-header d-flex flex-row justify-content-between">
        <h4
          className="text-truncate mb-0"
          title={script.attributes.name}
        >
          {script.attributes.name}
        </h4>
      </div>
      <div className="card-body d-flex flex-column">
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
                <span className="text-muted mr-1" title="Template is unknown">
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
        <ScriptActions
          className="mt-auto"
          includeLink={false}
          onDeleted={onDeleted}
          script={script}
        />
      </div>
    </div>
  );
}

export default ScriptMetadataCard;
