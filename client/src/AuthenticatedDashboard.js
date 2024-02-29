import { Link } from "react-router-dom";

import JobsPage from './JobsPage';
import Blurb from './Blurb';

function AuthenticatedDashboard() {
  return (
    <div
      className="centernav col-8"
    >
      <div className="narrow-container">
        <Blurb/>
      </div>
      <NewJobButton/>
      <JobsPage/>
    </div>
  );
}

function NewJobButton() {
  return (
    <>
      <Link
        className="btn btn-success btn-block"
        to="/scripts"
      >
        <i className="fa fa-plus mr-2"></i>
        <span>New job</span>
      </Link>
    </>
  );
}

export default AuthenticatedDashboard;
