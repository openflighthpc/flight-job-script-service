import React from 'react';

import Blurb from './Blurb';
import ClusterOverview from './ClusterOverview';

function UnauthenticatedDashboard() {
  return (
    <div>
      <ClusterOverview className="mt-2 mb-2" />
      <Blurb />
      <p>
        To start creating job scripts you will need to login by clicking the
        "Log in" button above.
      </p>
    </div>
  );
}

export default UnauthenticatedDashboard;
