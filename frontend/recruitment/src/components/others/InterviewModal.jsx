import React from 'react';

export default function InterviewModal({
	showInterviewModal,
	setShowInterviewModal,
	interviewForm,
	setInterviewForm,
	handleScheduleInterview,
	schedulingInterview,
	candidates,
	jobs,
	interviewers
}) {
	if (!showInterviewModal) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Schedule Interview</h3>
					<button
						onClick={() => setShowInterviewModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleScheduleInterview} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
							<select
								value={interviewForm.candidateId}
								onChange={(e) => setInterviewForm({ ...interviewForm, candidateId: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="">Select candidate</option>
								{candidates.map(candidate => (
									<option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
							<select
								value={interviewForm.jobId}
								onChange={(e) => setInterviewForm({ ...interviewForm, jobId: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="">Select job</option>
								{jobs.map(job => (
									<option key={job.id} value={job.id}>{job.title}</option>
								))}
							</select>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
							<input
								type="date"
								value={interviewForm.scheduledDate}
								onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
							<input
								type="time"
								value={interviewForm.scheduledTime}
								onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
							<select
								value={interviewForm.interviewType}
								onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option>Technical</option>
								<option>HR</option>
								<option>Managerial</option>
								<option>Final</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
							<select
								value={interviewForm.roundNo}
								onChange={(e) => setInterviewForm({ ...interviewForm, roundNo: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={1}>1</option>
								<option value={2}>2</option>
								<option value={3}>3</option>
								<option value={4}>4</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Interviewers</label>
						<select
							multiple
							value={interviewForm.interviewerIds}
							onChange={(e) => {
								const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10)).filter(id => !isNaN(id));
								setInterviewForm({ ...interviewForm, interviewerIds: selected });
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							{interviewers.map(interviewer => (
								<option key={interviewer.id} value={interviewer.id}>{interviewer.fullName}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
						<textarea
							rows={3}
							value={interviewForm.notes}
							onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
							placeholder="Add any additional notes..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowInterviewModal(false)}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={schedulingInterview}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{schedulingInterview ? 'Scheduling...' : 'Schedule Interview'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
