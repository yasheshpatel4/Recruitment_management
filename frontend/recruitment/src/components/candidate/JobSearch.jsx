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

const JobSearch = () => {
	const [searchFilters, setSearchFilters] = useState({
		searchTerm: '',
		location: '',
		experience: '',
		skills: '',
		salary: ''
	});
	const [jobs, setJobs] = useState([]);
	const [jobSearchError, setJobSearchError] = useState('');
	const [jobSearchLoading, setJobSearchLoading] = useState(false);
	const [applyingJobId, setApplyingJobId] = useState(null);
	const [applyError, setApplyError] = useState('');
	const [applySuccess, setApplySuccess] = useState('');

	useEffect(() => {
		searchJobs();
	}, []);

	const searchJobs = async () => {
		try {
			setJobSearchLoading(true);
			setJobSearchError('');
			const params = new URLSearchParams();
			if (searchFilters.searchTerm) params.append('search', searchFilters.searchTerm);
			if (searchFilters.location) params.append('location', searchFilters.location);
			if (searchFilters.experience) params.append('experience', searchFilters.experience);
			if (searchFilters.skills) params.append('skills', searchFilters.skills);
			if (searchFilters.salary) params.append('salary', searchFilters.salary);

			const data = await apiRequest(`/candidate/jobs?${params.toString()}`);
			setJobs(data || []);
		} catch (error) {
			console.error('Failed to search jobs:', error);
			setJobSearchError(error.message || 'Failed to search jobs. Please try again.');
			setJobs([]);
		} finally {
			setJobSearchLoading(false);
		}
	};

	const applyForJob = async (jobId) => {
		try {
			setApplyingJobId(jobId);
			setApplyError('');
			setApplySuccess('');
			await apiRequest(`/candidate/apply/${jobId}`, {
				method: 'POST'
			});
			setApplySuccess('Application submitted successfully!');
			// Refresh jobs list
			searchJobs();
		} catch (error) {
			setApplyError(error.message || 'Failed to apply for job');
		} finally {
			setApplyingJobId(null);
		}
	};

	const JobCard = ({ job }) => (
		<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
					<p className="text-sm text-gray-600">{job.company} • {job.location}</p>
					<div className="flex flex-wrap gap-2 mt-2">
						<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{job.experience}</span>
						<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{job.salary}</span>
						<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{job.postedDate}</span>
					</div>
					<div className="flex flex-wrap gap-1 mt-2">
						{job.skills && job.skills.map(skill => (
							<span key={skill} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
								{skill}
							</span>
						))}
					</div>
					<p className="text-sm text-gray-600 mt-2">{job.description}</p>
				</div>
				<div className="ml-4 flex flex-col gap-2">
					<button
						onClick={() => applyForJob(job.id)}
						disabled={applyingJobId === job.id}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
					>
						{applyingJobId === job.id ? 'Applying...' : 'Apply Now'}
					</button>
					<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
						Save Job
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-6">Job Search</h3>

				{/* Search Filters */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
						<input
							type="text"
							placeholder="Job title, company..."
							value={searchFilters.searchTerm}
							onChange={(e) => setSearchFilters({...searchFilters, searchTerm: e.target.value})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
						<input
							type="text"
							placeholder="Enter location"
							value={searchFilters.location}
							onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
						<select
							value={searchFilters.experience}
							onChange={(e) => setSearchFilters({...searchFilters, experience: e.target.value})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Any</option>
							<option value="0-1">0-1 years</option>
							<option value="1-3">1-3 years</option>
							<option value="3-5">3-5 years</option>
							<option value="5+">5+ years</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
						<input
							type="text"
							placeholder="Enter skills"
							value={searchFilters.skills}
							onChange={(e) => setSearchFilters({...searchFilters, skills: e.target.value})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* Salary Filter */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
					<select
						value={searchFilters.salary}
						onChange={(e) => setSearchFilters({...searchFilters, salary: e.target.value})}
						className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Any</option>
						<option value="50-80">$50k - $80k</option>
						<option value="80-120">$80k - $120k</option>
						<option value="120-150">$120k - $150k</option>
						<option value="150+">$150k+</option>
					</select>
				</div>

				{/* Search Button */}
				<div className="flex justify-end mb-6">
					<button
						onClick={searchJobs}
						disabled={jobSearchLoading}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{jobSearchLoading ? 'Searching...' : 'Search Jobs'}
					</button>
				</div>

				{/* Error Messages */}
				{jobSearchError && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						{jobSearchError}
					</div>
				)}

				{applyError && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						{applyError}
					</div>
				)}

				{applySuccess && (
					<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
						{applySuccess}
					</div>
				)}

				{/* Job Listings */}
				<div className="space-y-4">
					{jobSearchLoading ? (
						<div className="text-center py-8">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<p className="mt-2 text-gray-600">Searching jobs...</p>
						</div>
					) : jobs.length > 0 ? (
						jobs.map(job => (
							<JobCard key={job.id} job={job} />
						))
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>No jobs found. Try adjusting your search criteria.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default JobSearch;
