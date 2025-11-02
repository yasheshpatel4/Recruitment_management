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

export default function CandidateManagement({
	candidates,
	setSelectedCandidate,
	setShowCandidateModal
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [candidatesData, setCandidatesData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadCandidates();
	}, []);

	const loadCandidates = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiRequest('/candidates');
			setCandidatesData(data);
		} catch (error) {
			console.error('Failed to load candidates:', error);
			setError('Failed to load candidates. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const filteredCandidates = candidatesData.filter(candidate => {
		const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'All Status' || candidate.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Candidate Management</h3>
					<button
						onClick={() => setShowCandidateModal(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Add Candidate
					</button>
				</div>

				{/* Search and Filters */}
				<div className="flex gap-4 mb-6">
					<input
						type="text"
						placeholder="Search candidates..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option>All Status</option>
						<option>Applied</option>
						<option>Shortlisted</option>
						<option>Interview</option>
						<option>Selected</option>
						<option>Rejected</option>
					</select>
				</div>

				{/* Candidates Table */}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredCandidates.map(candidate => (
								<tr key={candidate.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">{candidate.name}</div>
										<div className="text-sm text-gray-500">{candidate.location}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 py-1 text-xs rounded-full ${
											candidate.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
											candidate.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
											candidate.status === 'Selected' ? 'bg-green-100 text-green-800' :
											'bg-gray-100 text-gray-800'
										}`}>
											{candidate.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button
											onClick={() => {
												setSelectedCandidate(candidate);
												setShowCandidateModal(true);
											}}
											className="text-blue-600 hover:text-blue-900 mr-3"
										>
											View
										</button>
										<button className="text-green-600 hover:text-green-900">Edit</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filteredCandidates.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						No candidates found matching your criteria.
					</div>
				)}
			</div>
		</div>
	);
}
