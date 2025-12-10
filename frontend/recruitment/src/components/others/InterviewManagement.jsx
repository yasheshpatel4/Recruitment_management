import React, { useState } from 'react';

export default function InterviewManagement({
	interviews,
	interviewLoading,
	handleStatusUpdate,
	updatingStatus,
	setSelectedInterview,
	setShowInterviewModal,
	setShowFeedbackModal
}) {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Interview Management</h3>
					<button
						onClick={() => setShowInterviewModal(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Schedule Interview
					</button>
				</div>

				{/* Interview List */}
				<div className="space-y-4">
					{interviewLoading ? (
						<div className="text-center py-8">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<p className="mt-2 text-gray-600">Loading interviews...</p>
						</div>
					) : interviews.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							No interviews found
						</div>
					) : (
						interviews.map(interview => (
							<div key={interview.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<h4 className="text-lg font-semibold text-gray-900">{interview.candidateName || 'Unknown Candidate'}</h4>
										<p className="text-sm text-gray-600">{interview.jobTitle || 'Unknown Job'}</p>
										<div className="flex items-center mt-2">
											<span className={`px-2 py-1 text-xs rounded-full ${
												interview.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
												interview.status === 'Other Interview' ? 'bg-blue-100 text-blue-800' :
												interview.status === 'Selected' ? 'bg-green-100 text-green-800' :
												interview.status === 'Rejected' ? 'bg-red-100 text-red-800' :
												interview.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
												'bg-gray-100 text-gray-800'
											}`}>
												{interview.status}
											</span>
											<span className="text-xs text-gray-500 ml-2">
												{new Date(interview.scheduledDate).toLocaleDateString()} at {new Date(interview.scheduledDate).toLocaleTimeString()}
											</span>
										</div>
										<div className="mt-2">
											<p className="text-xs text-gray-500">
												{interview.interviewType} • Round {interview.roundNo}
											</p>
											<p className="text-xs text-gray-500">
												Interviewers: {interview.interviewerNames ? interview.interviewerNames.join(', ') : 'Not assigned'}
											</p>
										</div>
									</div>
									<div className="ml-4 flex flex-col gap-2">
										<select
											value={interview.status}
											onChange={(e) => handleStatusUpdate(interview.id, e.target.value)}
											className="px-2 py-1 text-xs border border-gray-300 rounded"
											disabled={updatingStatus}
										>
											<option value="Scheduled">Scheduled</option>
											<option value="Other Interview">Other Interview</option>
											<option value="Selected">Selected</option>
											<option value="Rejected">Rejected</option>
											<option value="Cancelled">Cancelled</option>
										</select>
										<button
											onClick={() => {
												setSelectedInterview(interview);
												setShowFeedbackModal(true);
											}}
											className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
										>
											{interview.status === 'Selected' || interview.status === 'Rejected' ? 'View Feedback' : 'Add Feedback'}
										</button>
										<button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
											Edit
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
