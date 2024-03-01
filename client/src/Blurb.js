import React from 'react';
import {Link} from "react-router-dom";
import Logo from './assets/job.png';

function Blurb() {
  return (
    <>
      <Link
        className="app-card blurb link"
        relative="path"
        title="Back to Flight Job dashboard"
        to="/"
      >
        <img
          className="app-icon mr-3"
          alt=""
          src={Logo}
        />
        <h2 className="card-title card-text">
          flight<strong>Job</strong>
        </h2>
        <p className="tagline card-subtitle card-text">
          Create and manage your jobs.
        </p>
      </Link>
    </>
  );
}

export default Blurb;
