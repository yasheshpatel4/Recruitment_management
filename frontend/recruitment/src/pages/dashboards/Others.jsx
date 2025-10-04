import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

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

export default function Others() {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [showJobModal, setShowJobModal] = useState(false);
	const [showCandidateModal, setShowCandidateModal] = useState(false);
	const [showInterviewModal, setShowInterviewModal] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [jobToDelete, setJobToDelete] = useState(null);
	const [selectedCandidate, setSelectedCandidate] = useState(null);
	const [selectedInterview, setSelectedInterview] = useState(null);
	const [jobs, setJobs] = useState([]);
	const [candidates, setCandidates] = useState([]);
	const [skills, setSkills] = useState([]);
	const [editingJob, setEditingJob] = useState(null);
	const [jobForm, setJobForm] = useState({
		title: '',
		department: 'Engineering',
		location: '',
		minExperience: '0-1 years',
		description: '',
		status: 'Open',
		closedReason: '',
		selectedCandidateId: null,
		skillIds: []
	});

	const loadDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			let endpoint = '/dashboard/recruiter'; // Default
			
			if (user?.roles?.includes('HR')) {
				endpoint = '/dashboard/hr';
			} else if (user?.roles?.includes('Interviewer')) {
				endpoint = '/dashboard/interviewer';
			} else if (user?.roles?.includes('Reviewer')) {
				endpoint = '/dashboard/reviewer';
			}

			const data = await apiRequest(endpoint);
			setDashboardData(data);
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			setLoading(false);
		}
	}, [user?.roles]);

	const loadCandidates = useCallback(async () => {
		try {
			const data = await apiRequest('/candidate');
			setCandidates(data);
		} catch (error) {
			console.error('Failed to load candidates:', error);
		}
	}, []);

	const loadJobs = useCallback(async () => {
		try {
			const data = await apiRequest('/jobs');
			setJobs(data);
		} catch (error) {
			console.error('Failed to load jobs:', error);
		}
	}, []);

	const loadSkills = useCallback(async () => {
		try {
			const data = await apiRequest('/jobs/skills');
			setSkills(data);
		} catch (error) {
			console.error('Failed to load skills:', error);
		}
	}, []);

	useEffect(() => {
		loadDashboardData();
		loadCandidates();
		loadJobs();
		loadSkills();
	}, [loadDashboardData, loadCandidates, loadJobs, loadSkills]);

	useEffect(() => {
		if (editingJob) {
			setJobForm({
				title: editingJob.title || '',
				department: editingJob.department || 'Engineering',
				location: editingJob.location || '',
				minExperience: editingJob.minExperience || '0-1 years',
				description: editingJob.description || '',
				status: editingJob.status || 'Open',
				closedReason: editingJob.closedReason || '',
				selectedCandidateId: editingJob.selectedCandidateId || null,
				skillIds: editingJob.Skills ? editingJob.Skills.map(s => s.id) : []
			});
		} else {
			setJobForm({
				title: '',
				department: 'Engineering',
				location: '',
				minExperience: '0-1 years',
				description: '',
				status: 'Open',
				closedReason: '',
				selectedCandidateId: null,
				skillIds: []
			});
		}
	}, [editingJob]);

	const handleDeleteJob = async (jobId) => {
		setJobToDelete(jobId);
		setShowDeleteConfirm(true);
	};

	const confirmDeleteJob = async () => {
		if (!jobToDelete) return;

		try {
			await apiRequest(`/jobs/${jobToDelete}`, { method: 'DELETE' });
			loadJobs(); // Reload jobs after deletion
			setShowDeleteConfirm(false);
			setJobToDelete(null);
		} catch (error) {
			console.error('Failed to delete job:', error);
			alert('Failed to delete job');
		}
	};

	const handleJobSubmit = async (e) => {
		e.preventDefault();

		try {
			let payload;
			if (editingJob) {
				// Update existing job - send all fields
				payload = jobForm;
			} else {
				// Create new job - send only required fields
				payload = {
					title: jobForm.title,
					department: jobForm.department,
					description: jobForm.description,
					minExperience: jobForm.minExperience,
					location: jobForm.location,
					skillIds: jobForm.skillIds
				};
			}

			if (editingJob) {
				await apiRequest(`/jobs/${editingJob.id}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
			} else {
				await apiRequest('/jobs', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
			}

			loadJobs(); // Reload jobs after creation/update
			setShowJobModal(false);
			setEditingJob(null);
		} catch (error) {
			console.error('Failed to save job:', error);
			alert('Failed to save job');
		}
	};

	const handleJobModalClose = () => {
		setShowJobModal(false);
		setEditingJob(null);
	};

	const getRoleDisplayName = () => {
		if (user?.roles?.includes('HR')) return 'HR Manager';
		if (user?.roles?.includes('Recruiter')) return 'Recruiter';
		if (user?.roles?.includes('Interviewer')) return 'Interviewer';
		if (user?.roles?.includes('Reviewer')) return 'Reviewer';
		return 'Internal User';
	};

	const StatCard = ({ title, value, icon, color, change }) => (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex items-center">
				<div className={`p-3 rounded-full ${color}`}>
					{icon}
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-2xl font-semibold text-gray-900">{value}</p>
					{change && (
						<p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
							{change > 0 ? '+' : ''}{change}% from last month
						</p>
					)}
				</div>
			</div>
		</div>
	);

	const RecentItemCard = ({ item, type }) => (
		<div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="font-medium text-gray-900">{item.title || item.fullName || item.candidateName}</h4>
					<p className="text-sm text-gray-600">
						{type === 'job' && `${item.location} • ${item.minExperience}+ years`}
						{type === 'candidate' && `${item.email} • ${item.experienceYears} years exp`}
						{type === 'interview' && `${item.jobTitle} • Round ${item.roundNo}`}
					</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							item.status === 'Open' ? 'bg-green-100 text-green-800' :
							item.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
							item.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{item.status}
						</span>
						<span className="text-xs text-gray-500 ml-2">
							{new Date(item.createdAt || item.scheduledDate).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	const PendingTaskCard = ({ task }) => (
		<div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="font-medium text-gray-900">{task.title}</h4>
					<p className="text-sm text-gray-600">{task.description}</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							task.priority === 'High' ? 'bg-red-100 text-red-800' :
							task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
							'bg-green-100 text-green-800'
						}`}>
							{task.priority} Priority
						</span>
						<span className="text-xs text-gray-500 ml-2">
							Due: {new Date(task.dueDate).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	const NotificationCard = ({ notification }) => (
		<div className={`bg-white rounded-lg shadow p-4 ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}>
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<p className="text-sm text-gray-900">{notification.message}</p>
					<span className="text-xs text-gray-500">
						{new Date(notification.createdAt).toLocaleString()}
					</span>
				</div>
				{!notification.isRead && (
					<div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
				)}
			</div>
		</div>
	);

	const getRoleSpecificStats = () => {
		if (!dashboardData?.stats) return [];
		
		const stats = dashboardData.stats;
		const role = user?.roles?.[0];

		if (role === 'HR') {
			return [
				{ title: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: 'bg-blue-500' },
				{ title: 'Scheduled Interviews', value: stats.scheduledInterviews, icon: '📅', color: 'bg-yellow-500' },
				{ title: 'Pending Offers', value: stats.pendingOffers, icon: '📋', color: 'bg-purple-500' },
				{ title: 'Selected Candidates', value: stats.selectedCandidates, icon: '✅', color: 'bg-green-500' }
			];
		} else if (role === 'Recruiter') {
			return [
				{ title: 'Total Jobs', value: stats.totalJobs, icon: '💼', color: 'bg-blue-500' },
				{ title: 'Open Jobs', value: stats.openJobs, icon: '🔓', color: 'bg-green-500' },
				{ title: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: 'bg-purple-500' },
				{ title: 'Applied Candidates', value: stats.appliedCandidates, icon: '📝', color: 'bg-yellow-500' }
			];
		} else if (role === 'Interviewer') {
			return [
				{ title: 'My Interviews', value: stats.scheduledInterviews, icon: '🎯', color: 'bg-blue-500' },
				{ title: 'Completed', value: stats.completedInterviews, icon: '✅', color: 'bg-green-500' },
				{ title: 'Pending', value: stats.pendingInterviews, icon: '⏳', color: 'bg-yellow-500' },
				{ title: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: 'bg-purple-500' }
			];
		} else if (role === 'Reviewer') {
			return [
				{ title: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: 'bg-blue-500' },
				{ title: 'Applied', value: stats.appliedCandidates, icon: '📝', color: 'bg-yellow-500' },
				{ title: 'Shortlisted', value: stats.shortlistedCandidates, icon: '⭐', color: 'bg-green-500' },
				{ title: 'Rejected', value: stats.rejectedCandidates, icon: '❌', color: 'bg-red-500' }
			];
		}

		return [];
	};

	// Mock data for enhanced features
	const mockCandidates = [
		{
			id: 1,
			name: 'John Doe',
			email: 'john.doe@email.com',
			experience: '5 years',
			skills: ['React', 'Node.js', 'TypeScript'],
			status: 'Shortlisted',
			appliedDate: '2024-01-15',
			phone: '+1-555-0123',
			location: 'New York, NY'
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane.smith@email.com',
			experience: '3 years',
			skills: ['Python', 'Django', 'AWS'],
			status: 'Interview',
			appliedDate: '2024-01-20',
			phone: '+1-555-0124',
			location: 'San Francisco, CA'
		},
		{
			id: 3,
			name: 'Mike Johnson',
			email: 'mike.johnson@email.com',
			experience: '7 years',
			skills: ['Java', 'Spring', 'Microservices'],
			status: 'Selected',
			appliedDate: '2024-01-10',
			phone: '+1-555-0125',
			location: 'Chicago, IL'
		}
	];

	const mockJobs = [
		{
			id: 1,
			title: 'Senior Software Engineer',
			department: 'Engineering',
			location: 'New York, NY',
			experience: '5+ years',
			salary: '$120k - $150k',
			status: 'Open',
			applications: 15,
			postedDate: '2024-01-01',
			description: 'We are looking for a senior software engineer...'
		},
		{
			id: 2,
			title: 'Frontend Developer',
			department: 'Engineering',
			location: 'Remote',
			experience: '3+ years',
			salary: '$90k - $120k',
			status: 'Open',
			applications: 8,
			postedDate: '2024-01-05',
			description: 'Create beautiful user interfaces...'
		}
	];

	const mockInterviews = [
		{
			id: 1,
			candidateName: 'John Doe',
			jobTitle: 'Senior Software Engineer',
			date: '2024-01-25',
			time: '10:00 AM',
			type: 'Technical',
			round: 2,
			status: 'Scheduled',
			interviewers: ['Alice Johnson', 'Bob Smith']
		},
		{
			id: 2,
			candidateName: 'Jane Smith',
			jobTitle: 'Frontend Developer',
			date: '2024-01-26',
			time: '2:00 PM',
			type: 'HR',
			round: 1,
			status: 'Completed',
			interviewers: ['Carol Davis']
		}
	];

	// Modal Components
	const JobModal = () => (
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

	const CandidateModal = () => (
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
				
				{selectedCandidate && (
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
				)}
			</div>
		</div>
	);

	const InterviewModal = () => (
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
				
				<form className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
							<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option>Select candidate</option>
								{mockCandidates.map(candidate => (
									<option key={candidate.id} value={candidate.id}>{candidate.name}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
							<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option>Select job</option>
								{mockJobs.map(job => (
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
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
							<input
								type="time"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
							<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option>Technical</option>
								<option>HR</option>
								<option>Managerial</option>
								<option>Final</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
							<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option>1</option>
								<option>2</option>
								<option>3</option>
								<option>4</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Interviewers</label>
						<input
							type="text"
							placeholder="Enter interviewer names (comma separated)"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
						<textarea
							rows={3}
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
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Schedule Interview
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	const FeedbackModal = () => (
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

				{selectedInterview && (
					<form className="space-y-4">
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
								<label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</label>
								<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
									<option>Select rating</option>
									<option>Excellent (5)</option>
									<option>Good (4)</option>
									<option>Average (3)</option>
									<option>Below Average (2)</option>
									<option>Poor (1)</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
								<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
									<option>Select recommendation</option>
									<option>Strong Hire</option>
									<option>Hire</option>
									<option>No Decision</option>
									<option>No Hire</option>
									<option>Strong No Hire</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills</label>
							<textarea
								rows={3}
								placeholder="Rate technical skills and provide feedback..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Communication Skills</label>
							<textarea
								rows={3}
								placeholder="Rate communication skills and provide feedback..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Overall Comments</label>
							<textarea
								rows={4}
								placeholder="Provide overall feedback and recommendations..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							>
								Submit Feedback
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);

	const DeleteConfirmModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-gray-900">Confirm Deletion</h3>
					<button
						onClick={() => setShowDeleteConfirm(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-700">Are you sure you want to delete this job? This action cannot be undone.</p>
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={() => setShowDeleteConfirm(false)}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={confirmDeleteJob}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">{getRoleDisplayName()} Dashboard</h1>
							<p className="text-gray-600">Welcome back, {user?.fullName || user?.username}</p>
						</div>
						<button 
							onClick={logout} 
							className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
						>
							Logout
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading dashboard...</p>
					</div>
				) : dashboardData ? (
					<div className="space-y-8">
						{/* Navigation Tabs */}
						<div className="bg-white rounded-lg shadow">
							<div className="border-b border-gray-200">
								<nav className="-mb-px flex space-x-8 px-6">
									<button
										onClick={() => setActiveTab('overview')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'overview'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Overview
									</button>
									<button
										onClick={() => setActiveTab('candidates')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'candidates'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Candidates
									</button>
									<button
										onClick={() => setActiveTab('jobs')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'jobs'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Jobs
									</button>
									<button
										onClick={() => setActiveTab('interviews')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'interviews'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Interviews
									</button>
									<button
										onClick={() => setActiveTab('reports')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'reports'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Reports
									</button>
								</nav>
							</div>
						</div>

						{/* Tab Content */}
						{activeTab === 'overview' && (
							<div className="space-y-8">
								{/* Stats Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{getRoleSpecificStats().map((stat, index) => (
										<StatCard
											key={index}
											title={stat.title}
											value={stat.value}
											icon={<span className="text-2xl">{stat.icon}</span>}
											color={stat.color}
										/>
									))}
								</div>

								{/* Main Content Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Recent Candidates */}
									{dashboardData.recentCandidates && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidates</h3>
											<div className="space-y-4">
												{dashboardData.recentCandidates.slice(0, 5).map(candidate => (
													<RecentItemCard key={candidate.id} item={candidate} type="candidate" />
												))}
											</div>
										</div>
									)}

									{/* Recent Jobs (for Recruiters) */}
									{dashboardData.recentJobs && user?.roles?.includes('Recruiter') && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
											<div className="space-y-4">
												{dashboardData.recentJobs.slice(0, 5).map(job => (
													<RecentItemCard key={job.id} item={job} type="job" />
												))}
											</div>
										</div>
									)}

									{/* Upcoming Interviews */}
									{dashboardData.upcomingInterviews && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
											<div className="space-y-4">
												{dashboardData.upcomingInterviews.slice(0, 5).map(interview => (
													<RecentItemCard key={interview.id} item={interview} type="interview" />
												))}
											</div>
										</div>
									)}
								</div>

								{/* Bottom Row */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Pending Tasks */}
									{dashboardData.pendingTasks && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
											<div className="space-y-4">
												{dashboardData.pendingTasks.slice(0, 5).map(task => (
													<PendingTaskCard key={task.id} task={task} />
												))}
											</div>
										</div>
									)}

									{/* Notifications */}
									{dashboardData.notifications && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
											<div className="space-y-4">
												{dashboardData.notifications.slice(0, 5).map(notification => (
													<NotificationCard key={notification.id} notification={notification} />
												))}
											</div>
										</div>
									)}
								</div>

								{/* Role-specific Quick Actions */}
								<div className="bg-white rounded-lg shadow p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										{user?.roles?.includes('Recruiter') && (
											<>
												<button 
													onClick={() => setShowJobModal(true)}
													className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
												>
													<div className="text-center">
														<div className="text-2xl mb-2">➕</div>
														<div className="text-sm font-medium">Create Job</div>
													</div>
												</button>
												<button 
													onClick={() => setShowCandidateModal(true)}
													className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
												>
													<div className="text-center">
														<div className="text-2xl mb-2">📝</div>
														<div className="text-sm font-medium">Add Candidate</div>
													</div>
												</button>
											</>
										)}
										{user?.roles?.includes('HR') && (
											<>
												<button 
													onClick={() => setShowInterviewModal(true)}
													className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
												>
													<div className="text-center">
														<div className="text-2xl mb-2">📋</div>
														<div className="text-sm font-medium">Schedule Interview</div>
													</div>
												</button>
												<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
													<div className="text-center">
														<div className="text-2xl mb-2">📄</div>
														<div className="text-sm font-medium">Verify Documents</div>
													</div>
												</button>
											</>
										)}
										{user?.roles?.includes('Interviewer') && (
											<>
												<button 
													onClick={() => setShowFeedbackModal(true)}
													className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
												>
													<div className="text-center">
														<div className="text-2xl mb-2">📝</div>
														<div className="text-sm font-medium">Add Feedback</div>
													</div>
												</button>
												<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
													<div className="text-center">
														<div className="text-2xl mb-2">📊</div>
														<div className="text-sm font-medium">View Schedule</div>
													</div>
												</button>
											</>
										)}
										{user?.roles?.includes('Reviewer') && (
											<>
												<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
													<div className="text-center">
														<div className="text-2xl mb-2">🔍</div>
														<div className="text-sm font-medium">Review CVs</div>
													</div>
												</button>
												<button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
													<div className="text-center">
														<div className="text-2xl mb-2">⭐</div>
														<div className="text-sm font-medium">Shortlist</div>
													</div>
												</button>
											</>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Candidates Tab */}
						{activeTab === 'candidates' && (
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
											className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
												{mockCandidates.map(candidate => (
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
								</div>
							</div>
						)}

						{/* Jobs Tab */}
						{activeTab === 'jobs' && (
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
											className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option>All Status</option>
											<option>Open</option>
											<option>Closed</option>
											<option>Draft</option>
										</select>
									</div>

									{/* Jobs Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{jobs.map(job => (
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
													<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{job.minExperience}+ years</span>
													<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{job.Skills?.length || 0} skills</span>
													<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">0 applications</span>
												</div>
												<p className="text-sm text-gray-600 mb-4">{job.description}</p>
												<div className="flex justify-between items-center">
													<span className="text-xs text-gray-500">Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
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
								</div>
							</div>
						)}

						{/* Interviews Tab */}
						{activeTab === 'interviews' && (
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
										{mockInterviews.map(interview => (
											<div key={interview.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<h4 className="text-lg font-semibold text-gray-900">{interview.candidateName}</h4>
														<p className="text-sm text-gray-600">{interview.jobTitle}</p>
														<div className="flex items-center mt-2">
															<span className={`px-2 py-1 text-xs rounded-full ${
																interview.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
																interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
																'bg-gray-100 text-gray-800'
															}`}>
																{interview.status}
															</span>
															<span className="text-xs text-gray-500 ml-2">
																{interview.date} at {interview.time}
															</span>
														</div>
														<div className="mt-2">
															<p className="text-xs text-gray-500">
																{interview.type} • Round {interview.round}
															</p>
															<p className="text-xs text-gray-500">
																Interviewers: {interview.interviewers.join(', ')}
															</p>
														</div>
													</div>
													<div className="ml-4 flex flex-col gap-2">
														<button 
															onClick={() => {
																setSelectedInterview(interview);
																setShowFeedbackModal(true);
															}}
															className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
														>
															{interview.status === 'Completed' ? 'View Feedback' : 'Add Feedback'}
														</button>
														<button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
															Edit
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Reports Tab */}
						{activeTab === 'reports' && (
							<div className="space-y-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<div className="bg-white rounded-lg shadow p-6">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Analytics</h3>
										<div className="space-y-4">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Total Applications</span>
												<span className="text-lg font-semibold">156</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Interview Rate</span>
												<span className="text-lg font-semibold">23%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Hire Rate</span>
												<span className="text-lg font-semibold">8%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Time to Hire</span>
												<span className="text-lg font-semibold">28 days</span>
											</div>
										</div>
									</div>

									<div className="bg-white rounded-lg shadow p-6">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Source Analysis</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">LinkedIn</span>
												<span className="text-sm font-medium">45%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Company Website</span>
												<span className="text-sm font-medium">30%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Referrals</span>
												<span className="text-sm font-medium">15%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Other</span>
												<span className="text-sm font-medium">10%</span>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-white rounded-lg shadow p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
									<div className="space-y-3">
										<div className="flex items-center space-x-3">
											<div className="w-2 h-2 bg-green-500 rounded-full"></div>
											<span className="text-sm text-gray-600">New application received for Senior Developer position</span>
											<span className="text-xs text-gray-500">2 hours ago</span>
										</div>
										<div className="flex items-center space-x-3">
											<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
											<span className="text-sm text-gray-600">Interview scheduled with John Doe</span>
											<span className="text-xs text-gray-500">4 hours ago</span>
										</div>
										<div className="flex items-center space-x-3">
											<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
											<span className="text-sm text-gray-600">Candidate shortlisted for Frontend Developer role</span>
											<span className="text-xs text-gray-500">1 day ago</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Modals */}
						{showJobModal && <JobModal />}
						{showCandidateModal && <CandidateModal />}
						{showInterviewModal && <InterviewModal />}
						{showFeedbackModal && <FeedbackModal />}
						{showDeleteConfirm && <DeleteConfirmModal />}
					</div>
				) : (
					<div className="text-center py-8 text-gray-500">
						Failed to load dashboard data
					</div>
				)}
			</div>
		</div>
	);
}
