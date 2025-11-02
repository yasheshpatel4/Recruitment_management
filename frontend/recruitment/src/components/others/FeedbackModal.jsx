import React from 'react';

export default function FeedbackModal({
	showFeedbackModal,
	setShowFeedbackModal,
	selectedInterview,
	feedbackForm,
	setFeedbackForm,
	handleFeedbackSubmit,
	submittingFeedback,
	interviewers
}) {
	if (!showFeedbackModal || !selectedInterview) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Submit Interview Feedback</h3>
					<button
						onClick={() => setShowFeedbackModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleFeedbackSubmit} className="space-y-4">
					<div className="bg-gray-50 p-4 rounded-lg">
						<h4 className="font-medium text-gray-900">Interview Details</h4>
						<p className="text-sm text-gray-600">
							{selectedInterview.candidateName} - {selectedInterview.jobTitle}
						</p>
						<p className="text-sm text-gray-600">
							{selectedInterview.date} at {selectedInterview.time}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
							<select
								value={feedbackForm.interviewerId}
								onChange={(e) => setFeedbackForm({ ...feedbackForm, interviewerId: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="">Select interviewer</option>
								{interviewers.map(interviewer => (
									<option key={interviewer.id} value={interviewer.id}>{interviewer.fullName}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</label>
							<select
								value={feedbackForm.rating}
								onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="">Select rating</option>
								<option value="5">Excellent (5)</option>
								<option value="4">Good (4)</option>
								<option value="3">Average (3)</option>
								<option value="2">Below Average (2)</option>
								<option value="1">Poor (1)</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Overall Comments</label>
						<textarea
							rows={4}
							value={feedbackForm.comments}
							onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
							placeholder="Provide overall feedback and recommendations..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						></textarea>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowFeedbackModal(false)}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submittingFeedback}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
