import React from 'react';

export default function CandidateModal({
	showCandidateModal,
	setShowCandidateModal,
	selectedCandidate,
	setShowInterviewModal
}) {
	if (!showCandidateModal || !selectedCandidate) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Candidate Details</h3>
					<button
						onClick={() => setShowCandidateModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700">Name</label>
									<p className="text-sm text-gray-900">{selectedCandidate.name}</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Email</label>
									<p className="text-sm text-gray-900">{selectedCandidate.email}</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Phone</label>
									<p className="text-sm text-gray-900">{selectedCandidate.phone}</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Location</label>
									<p className="text-sm text-gray-900">{selectedCandidate.location}</p>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h4>
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700">Experience</label>
									<p className="text-sm text-gray-900">{selectedCandidate.experience}</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Skills</label>
									<div className="flex flex-wrap gap-1 mt-1">
										{selectedCandidate.skills.map(skill => (
											<span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
												{skill}
											</span>
										))}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Status</label>
									<span className={`px-2 py-1 text-xs rounded-full ${
										selectedCandidate.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
										selectedCandidate.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
										selectedCandidate.status === 'Selected' ? 'bg-green-100 text-green-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{selectedCandidate.status}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3">
						<button
							onClick={() => setShowCandidateModal(false)}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Close
						</button>
						<button
							onClick={() => {
								setShowCandidateModal(false);
								setShowInterviewModal(true);
							}}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Schedule Interview
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
