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

export default function JobManagement({
	jobs,
	setEditingJob,
	setShowJobModal,
	handleDeleteJob
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [jobsData, setJobsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadJobs();
	}, []);

	const loadJobs = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiRequest('/jobs');
			setJobsData(data);
		} catch (error) {
			console.error('Failed to load jobs:', error);
			setError('Failed to load jobs. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const filteredJobs = jobsData.filter(job => {
		const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 job.location?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Job Management</h3>
					<button
						onClick={() => setShowJobModal(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Create Job
					</button>
				</div>

				{/* Search and Filters */}
				<div className="flex gap-4 mb-6">
					<input
						type="text"
						placeholder="Search jobs..."
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
						<option>Open</option>
						<option>Closed</option>
						<option>Draft</option>
					</select>
				</div>

				{/* Jobs Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredJobs.map(job => (
						<div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
							<div className="flex justify-between items-start mb-2">
								<h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
								<span className={`px-2 py-1 text-xs rounded-full ${
									job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
								}`}>
									{job.status}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-2">{job.department} • {job.location}</p>
							<div className="flex flex-wrap gap-2 mb-3">
								<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{job.experience}+ years</span>
								<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{job.applications} applications</span>
							</div>
							<p className="text-sm text-gray-600 mb-4">{job.description}</p>
							<div className="flex justify-between items-center">
								<span className="text-xs text-gray-500">Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
								<div className="flex gap-2">
									<button
										onClick={() => {
											setEditingJob(job);
											setShowJobModal(true);
										}}
										className="text-blue-600 hover:text-blue-900 text-sm"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteJob(job.id)}
										className="text-red-600 hover:text-red-900 text-sm"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{filteredJobs.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						No jobs found matching your criteria.
					</div>
				)}
			</div>
		</div>
	);
}
