import { ConfirmedActionButton, utils, } from 'flight-webapp-components';

import { useDeleteJob } from './api';
import { useToast } from './ToastContext';

function DeleteJobButton({
  className,
  onDelete=()=>{},
  onDeleted=()=>{},
  job,
}) {
  const { loading: deleting, del, response } = useDeleteJob(job.id)
  const { addToast } = useToast();
  const deleteJob = async () => {
    onDelete();
    try {
      const responseBody = await del();
      if (response.ok) {
        onDeleted(response);
      } else {
        addToast(deleteFailedToast({
          job: job,
          errorCode: utils.errorCode(responseBody),
        }));
      }
    } catch (e) {
      console.log(e);
      addToast(deleteFailedToast({
        job: job,
        errorCode: undefined,
      }));
    }
  };

  return (
    <ConfirmedActionButton
      act={deleteJob}
      acting={deleting}
      actingButtonText="Removing..."
      buttonText="REMOVE"
      className={className}
      confirmationHeaderText="Confirm job removal"
      confirmationText={
        <>
          <p>
            This will permanently remove Flight Job's record of this job.
            Flight Job will no longer be able to help you access this job's
            results.
          </p>
          <p>
            If a record is kept elsewhere such as the HPC scheduler's
            accounting database, that record will not be affected.
          </p>
        </>
      }
      id={`delete-job-${job.id}`}
    />
  );
}

function deleteFailedToast({ job, errorCode }) {
  return {
    body: (
      <div>
        Unfortunately there has been a problem deleting your job.
        Please try again and, if problems persist, help us to
        more quickly rectify the problem by contacting us and letting us
        know.
      </div>
    ),
    icon: 'danger',
    header: 'Failed to delete job',
  };
}

export default DeleteJobButton;

