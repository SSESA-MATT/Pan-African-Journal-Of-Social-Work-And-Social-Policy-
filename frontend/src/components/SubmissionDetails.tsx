import React from 'react';

interface SubmissionDetailsProps {
  submissionId: string;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submissionId }) => {
  return (
    <div className="submission-details">
      <h2>Submission Details</h2>
      <p>Submission ID: {submissionId}</p>
      <div className="details-content">
        {/* TODO: Implement submission details display */}
        <p>Submission details will be displayed here.</p>
      </div>
    </div>
  );
};

export default SubmissionDetails;