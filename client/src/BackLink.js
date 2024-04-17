import React from "react";
import {Link} from "react-router-dom";

function BackLink({ link }) {
  const linkToDashboard = link === undefined

  return (
    <Link
      to={`/${linkToDashboard ? '' : link}`}
      relative="path"
      className="link back-link blue-text"
    >
      Back to {linkToDashboard ? 'jobs' : link}
    </Link>
  );
}

export default BackLink;
