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
      <JobsPage/>
    </div>
  );
}

export default AuthenticatedDashboard;
