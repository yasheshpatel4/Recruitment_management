import React from 'react';

export default function JobModal({
	showJobModal,
	handleJobModalClose,
	editingJob,
	jobForm,
	setJobForm,
	handleJobSubmit,
	skills,
	candidates
}) {
	if (!showJobModal) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">{editingJob ? 'Edit Job' : 'Create New Job'}</h3>
					<button
						onClick={handleJobModalClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleJobSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
							<input
								type="text"
								value={jobForm.title}
								onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
								placeholder="Enter job title"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
							<select
								value={jobForm.department}
								onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option>Engineering</option>
								<option>Marketing</option>
								<option>Sales</option>
								<option>HR</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
							<input
								type="text"
								value={jobForm.location}
								onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
								placeholder="Enter location"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
							<select
								value={jobForm.minExperience}
								onChange={(e) => setJobForm({ ...jobForm, minExperience: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option>0-1 years</option>
								<option>1-3 years</option>
								<option>3-5 years</option>
								<option>5+ years</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
						<textarea
							rows={4}
							value={jobForm.description}
							onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
							placeholder="Enter job description..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						></textarea>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
							<select
								value={jobForm.status}
								onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option>Open</option>
								<option>Closed</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Selected Candidate</label>
							<select
								value={jobForm.selectedCandidateId || ''}
								onChange={(e) => setJobForm({ ...jobForm, selectedCandidateId: e.target.value ? parseInt(e.target.value) : null })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">No candidate selected</option>
								{candidates.map(candidate => (
									<option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>
								))}
							</select>
						</div>
					</div>

					{jobForm.status === 'Closed' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Closed Reason</label>
							<textarea
								rows={3}
								value={jobForm.closedReason}
								onChange={(e) => setJobForm({ ...jobForm, closedReason: e.target.value })}
								placeholder="Enter reason for closing the job..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							></textarea>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
						<select
							multiple
							value={jobForm.skillIds}
							onChange={(e) => {
								const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10)).filter(id => !isNaN(id));
								setJobForm({ ...jobForm, skillIds: selected });
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{skills.map(skill => (
								<option key={skill.id} value={skill.id}>{skill.name}</option>
							))}
						</select>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={handleJobModalClose}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							{editingJob ? 'Update Job' : 'Create Job'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
