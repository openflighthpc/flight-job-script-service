import { Badge } from 'reactstrap';

import { stateColourMap } from './utils';

function JobStateBadges({ job }) {
  const jobState = job.attributes.state;
  const colour = stateColourMap[jobState];
  let scriptType = "Batch job";
  if (job.attributes.interactive) {
    scriptType = "Desktop session";
  }

  return (
    <>
    <Badge className="mr-2" color={colour}>{jobState}</Badge>
    <Badge color={colour}>{scriptType}</Badge>
    </>
  );
}

export default JobStateBadges;
