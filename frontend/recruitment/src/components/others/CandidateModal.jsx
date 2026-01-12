import React, { useState, useEffect } from 'react';
const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
	const token = localStorage.getItem('rp_token');
	const config = {
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
	},
		...options,
	};

	const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'API request failed');
	}

	return data;
}

export default function CandidateModal({
	showCandidateModal,
	setShowCandidateModal,
	selectedCandidate,
	setShowInterviewModal,
	loadCandidates
}) {
	const [documents, setDocuments] = useState([]);
	const [loadingDocuments, setLoadingDocuments] = useState(false);
	const [addForm, setAddForm] = useState({
		fullName: '',
		email: '',
		username: ''
	});
	const [addingCandidate, setAddingCandidate] = useState(false);

	useEffect(() => {
		if (showCandidateModal && selectedCandidate) {
			loadCandidateDocuments();
		}
	}, [showCandidateModal, selectedCandidate]);

	const loadCandidateDocuments = async () => {
		try {
			setLoadingDocuments(true);
			const data = await apiRequest(`/candidates/${selectedCandidate.id}/documents`);
			setDocuments(data);
		} catch (error) {
			console.error('Failed to load candidate documents:', error);
			setDocuments([]);
		} finally {
			setLoadingDocuments(false);
		}
	};

	if (!showCandidateModal) return null;

	const handleAddCandidate = async (e) => {
		e.preventDefault();
		try {
			setAddingCandidate(true);
			const password = addForm.username + '123';
			await apiRequest('/auth/register', {
				method: 'POST',
				body: JSON.stringify({
					fullName: addForm.fullName,
					email: addForm.email,
					username: addForm.username,
					password: password,
					roles: ['Candidate']
				})
			});
			setShowCandidateModal(false);
			setAddForm({ fullName: '', email: '', username: '' });
			if (loadCandidates) loadCandidates();
		} catch (error) {
			console.error('Failed to add candidate:', error);
			alert('Failed to add candidate. Please try again.');
		} finally {
			setAddingCandidate(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">{selectedCandidate ? 'Candidate Details' : 'Add New Candidate'}</h3>
					<button
						onClick={() => setShowCandidateModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{selectedCandidate ? (
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
						{/* Documents Section */}
						<div>
							<h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
							{loadingDocuments ? (
								<div className="text-center py-4">
									<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
									<p className="mt-2 text-sm text-gray-600">Loading documents...</p>
								</div>
							) : documents.length > 0 ? (
								<div className="space-y-3">
									{documents.map(document => (
										<div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center space-x-3">
												<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
												<div>
													<p className="text-sm font-medium text-gray-900">{document.documentType}</p>
													<p className="text-xs text-gray-500">Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</p>
													{document.verified && (
														<p className="text-xs text-green-600">✓ Verified</p>
													)}
												</div>
											</div>
											<a
												href={`http://localhost:5000${document.url}`}
												target="_blank"
												rel="noopener noreferrer"
												className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
											>
												View
											</a>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-gray-500">No documents available</p>
							)}
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
				) : (
					<form onSubmit={handleAddCandidate} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h4>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700">Full Name</label>
										<input
											type="text"
											required
											value={addForm.fullName}
											onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Email</label>
										<input
											type="email"
											required
											value={addForm.email}
											onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Username</label>
										<input
											type="text"
											required
											value={addForm.username}
											onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
										<p className="text-xs text-gray-500 mt-1">Password will be: {addForm.username}123</p>
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setShowCandidateModal(false)}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={addingCandidate}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
							>
								{addingCandidate ? 'Adding...' : 'Add Candidate'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
