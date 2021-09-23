import { ConfirmedActionButton, utils, } from 'flight-webapp-components';

import { useCancelJob } from './api';
import { useToast } from './ToastContext';

function CancelJobButton({
  className,
  onCancel=()=>{},
  onCancelled=()=>{},
  job,
}) {
  const { loading, patch, response } = useCancelJob(job.id)
  const { addToast } = useToast();
  const cancelJob = async () => {
    onCancel();
    try {
      const responseBody = await patch();
      if (response.ok) {
        onCancelled(response);
      } else {
        addToast(cancelFailedToast({
          job: job,
          errorCode: utils.errorCode(responseBody),
        }));
      }
    } catch (e) {
      console.log(e);
      addToast(cancelFailedToast({
        job: job,
        errorCode: undefined,
      }));
    }
  };

  return (
    <ConfirmedActionButton
      act={cancelJob}
      acting={loading}
      actingButtonText="Cancelling..."
      buttonText="Cancel"
      className={className}
      confirmationHeaderText="Confirm job cancellation"
      confirmationText={
        <>
          <p>
            Are you sure you want to cancel this job?
          </p>
          <p>
            Cancelling the job may prevent it from fully processing its data.
          </p>
        </>
      }
      icon="fa-ban"
      id={`cancel-job-${job.id}`}
    />
  );
}

function cancelFailedToast({ job, errorCode }) {
  return {
    body: (
      <div>
        Unfortunately there has been a problem cancelling your job.
        Please try again and, if problems persist, help us to
        more quickly rectify the problem by contacting us and letting us
        know.
      </div>
    ),
    icon: 'danger',
    header: 'Failed to cancel job',
  };
}

export default CancelJobButton;
