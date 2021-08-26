import { Badge } from 'reactstrap';

import { getTagValue, stateColourMap } from './utils';

function prettyScriptType(script) {
  if (script == null) {
    return undefined;
  }
  const scriptType = getTagValue(script.attributes.tags, 'script:type');
  if (scriptType === 'interactive') {
    const sessionType = getTagValue(script.attributes.tags, 'session:type');
    if (sessionType === 'desktop') {
      return 'Desktop session';
    }
  }
  return "Batch job";
}

function iconForType(script) {
  if (script == null) {
    return null;
  }
  const scriptType = getTagValue(script.attributes.tags, 'script:type');
  if (scriptType === 'interactive') {
    const sessionType = getTagValue(script.attributes.tags, 'session:type');
    if (sessionType === 'desktop') {
      return <i className="fa fa-desktop"></i>;
    }
  }
  return <i className="fa fa-clock-o"></i>;
}

export function ScriptTypeBadge({ color, script }) {
  const scriptType = prettyScriptType(script);
  const icon = iconForType(script);

  return scriptType == null ?
    null:
    <Badge color={color}>
      {icon}
      {scriptType}
    </Badge>;
}

function JobStateBadges({ job }) {
  const jobState = job.attributes.state;
  const color = stateColourMap[jobState];

  return (
    <>
    <Badge color={color}>{jobState}</Badge>
    <span className="ml-1 mr-1">/</span>
    <ScriptTypeBadge color={color} script={job.script} />
    </>
  );
}

export default JobStateBadges;
