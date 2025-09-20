import React, { useState, useEffect } from 'react';
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

export default function Candidate() {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [showJobSearch, setShowJobSearch] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showResumeUpload, setShowResumeUpload] = useState(false);
	const [searchFilters, setSearchFilters] = useState({
		location: '',
		experience: '',
		skills: '',
		salary: ''
	});

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const data = await apiRequest('/dashboard/candidate');
			setDashboardData(data);
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const StatCard = ({ title, value, icon, color, description }) => (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex items-center">
				<div className={`p-3 rounded-full ${color}`}>
					{icon}
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-2xl font-semibold text-gray-900">{value}</p>
					{description && (
						<p className="text-sm text-gray-500">{description}</p>
					)}
				</div>
			</div>
		</div>
	);

	const ApplicationCard = ({ application }) => (
		<div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
					<p className="text-sm text-gray-600">{application.jobLocation}</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
							application.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
							application.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
							application.status === 'Selected' ? 'bg-green-100 text-green-800' :
							application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{application.status}
						</span>
						<span className="text-xs text-gray-500 ml-2">
							Applied: {new Date(application.appliedDate).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	const InterviewCard = ({ interview }) => (
		<div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="font-medium text-gray-900">{interview.jobTitle}</h4>
					<p className="text-sm text-gray-600">
						{interview.interviewType} • Round {interview.roundNo}
					</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							interview.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
							interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
							interview.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{interview.status}
						</span>
						<span className="text-xs text-gray-500 ml-2">
							{new Date(interview.scheduledDate).toLocaleString()}
						</span>
					</div>
					{interview.interviewers && interview.interviewers.length > 0 && (
						<div className="mt-2">
							<p className="text-xs text-gray-500">
								Interviewers: {interview.interviewers.join(', ')}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	const OfferCard = ({ offer }) => (
		<div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h4 className="font-medium text-gray-900">{offer.jobTitle}</h4>
					<p className="text-sm text-gray-600">
						Offer Date: {new Date(offer.offerDate).toLocaleDateString()}
						{offer.joiningDate && ` • Joining: ${new Date(offer.joiningDate).toLocaleDateString()}`}
					</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							offer.status === 'Offered' ? 'bg-blue-100 text-blue-800' :
							offer.status === 'Accepted' ? 'bg-green-100 text-green-800' :
							offer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
							offer.status === 'Joined' ? 'bg-purple-100 text-purple-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{offer.status}
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

	const getStatusColor = (status) => {
		switch (status) {
			case 'Applied': return 'text-blue-600';
			case 'Shortlisted': return 'text-yellow-600';
			case 'Interview': return 'text-purple-600';
			case 'Selected': return 'text-green-600';
			case 'Rejected': return 'text-red-600';
			case 'On Hold': return 'text-orange-600';
			default: return 'text-gray-600';
		}
	};

	const getStatusDescription = (status) => {
		switch (status) {
			case 'Applied': return 'Your application has been received and is under review';
			case 'Shortlisted': return 'Congratulations! You have been shortlisted for the next round';
			case 'Interview': return 'You have been selected for an interview';
			case 'Selected': return 'Congratulations! You have been selected for the position';
			case 'Rejected': return 'Unfortunately, you were not selected for this position';
			case 'On Hold': return 'Your application is currently on hold';
			default: return 'Status unknown';
		}
	};

	// Mock data for enhanced features
	const mockJobs = [
		{
			id: 1,
			title: 'Senior Software Engineer',
			company: 'Tech Corp',
			location: 'New York, NY',
			experience: '5+ years',
			salary: '$120k - $150k',
			skills: ['React', 'Node.js', 'TypeScript'],
			postedDate: '2 days ago',
			description: 'We are looking for a senior software engineer with 5+ years of experience...'
		},
		{
			id: 2,
			title: 'Full Stack Developer',
			company: 'StartupXYZ',
			location: 'San Francisco, CA',
			experience: '3+ years',
			salary: '$100k - $130k',
			skills: ['JavaScript', 'Python', 'AWS'],
			postedDate: '1 week ago',
			description: 'Join our growing team as a full stack developer...'
		},
		{
			id: 3,
			title: 'Frontend Developer',
			company: 'Design Co',
			location: 'Remote',
			experience: '2+ years',
			salary: '$80k - $110k',
			skills: ['React', 'Vue.js', 'CSS'],
			postedDate: '3 days ago',
			description: 'Create beautiful user interfaces for our products...'
		}
	];

	const mockSkills = ['React', 'JavaScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'SQL', 'TypeScript', 'Vue.js'];

	const JobSearchModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Job Search</h3>
					<button 
						onClick={() => setShowJobSearch(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				{/* Search Filters */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
						<select
							value={searchFilters.salary}
							onChange={(e) => setSearchFilters({...searchFilters, salary: e.target.value})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Any</option>
							<option value="50-80">$50k - $80k</option>
							<option value="80-120">$80k - $120k</option>
							<option value="120-150">$120k - $150k</option>
							<option value="150+">$150k+</option>
						</select>
					</div>
				</div>

				{/* Job Listings */}
				<div className="space-y-4">
					{mockJobs.map(job => (
						<div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
										{job.skills.map(skill => (
											<span key={skill} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
												{skill}
											</span>
										))}
									</div>
									<p className="text-sm text-gray-600 mt-2">{job.description}</p>
								</div>
								<div className="ml-4 flex flex-col gap-2">
									<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
										Apply Now
									</button>
									<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
										Save Job
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const ProfileModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Update Profile</h3>
					<button 
						onClick={() => setShowProfileModal(false)}
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
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								defaultValue={user?.fullName || ''}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								defaultValue={user?.email || ''}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
							<input
								type="tel"
								placeholder="Enter phone number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
							<input
								type="number"
								defaultValue={dashboardData?.candidate?.experienceYears || 0}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
						<div className="flex flex-wrap gap-2 mb-2">
							{mockSkills.map(skill => (
								<span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full cursor-pointer hover:bg-blue-200">
									{skill} ×
								</span>
							))}
						</div>
						<input
							type="text"
							placeholder="Add new skill"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
						<textarea
							rows={4}
							placeholder="Tell us about yourself..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowProfileModal(false)}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	const ResumeUploadModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Upload Resume</h3>
					<button 
						onClick={() => setShowResumeUpload(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
					<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
						<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<div className="mt-4">
						<label htmlFor="file-upload" className="cursor-pointer">
							<span className="mt-2 block text-sm font-medium text-gray-900">
								Drop your resume here, or <span className="text-blue-600">browse</span>
							</span>
							<input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" />
						</label>
						<p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
					</div>
				</div>

				<div className="mt-6">
					<button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
						Upload Resume
					</button>
				</div>
			</div>
		</div>
	);

	const AnalyticsCard = ({ title, data, type }) => (
		<div className="bg-white rounded-lg shadow p-6">
			<h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
			{type === 'chart' ? (
				<div className="h-32 bg-gray-100 rounded flex items-center justify-center">
					<span className="text-gray-500">Chart placeholder</span>
				</div>
			) : (
				<div className="space-y-2">
					{data.map((item, index) => (
						<div key={index} className="flex justify-between items-center">
							<span className="text-sm text-gray-600">{item.label}</span>
							<span className="text-sm font-medium">{item.value}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
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
										onClick={() => setActiveTab('jobs')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'jobs'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Job Search
									</button>
									<button
										onClick={() => setActiveTab('profile')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'profile'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Profile
									</button>
									<button
										onClick={() => setActiveTab('analytics')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'analytics'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Analytics
									</button>
								</nav>
							</div>
						</div>

						{/* Tab Content */}
						{activeTab === 'overview' && (
							<div className="space-y-8">
								{/* Profile Status Card */}
								<div className="bg-white rounded-lg shadow p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<div className="p-3 rounded-full bg-blue-500">
												<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
											<div className="ml-4">
												<h3 className="text-lg font-semibold text-gray-900">
													{dashboardData.candidate.user.fullName}
												</h3>
												<p className="text-sm text-gray-600">{dashboardData.candidate.user.email}</p>
												<p className="text-sm text-gray-500">
													{dashboardData.candidate.experienceYears} years of experience
												</p>
											</div>
										</div>
										<div className="text-right">
											<div className={`text-lg font-semibold ${getStatusColor(dashboardData.candidate.status)}`}>
												{dashboardData.candidate.status}
											</div>
											<p className="text-sm text-gray-500">
												{getStatusDescription(dashboardData.candidate.status)}
											</p>
										</div>
									</div>
								</div>

								{/* Stats Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									<StatCard
										title="Applications"
										value={dashboardData.appliedJobs?.length || 0}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
										color="bg-blue-500"
										description="Total applications submitted"
									/>
									<StatCard
										title="Interviews"
										value={dashboardData.interviews?.length || 0}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
										color="bg-yellow-500"
										description="Interviews scheduled"
									/>
									<StatCard
										title="Offers"
										value={dashboardData.offers?.length || 0}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
										color="bg-green-500"
										description="Job offers received"
									/>
									<StatCard
										title="Notifications"
										value={dashboardData.notifications?.filter(n => !n.isRead).length || 0}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7H4.828z" /></svg>}
										color="bg-purple-500"
										description="Unread notifications"
									/>
								</div>

								{/* Main Content Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Job Applications */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applications</h3>
										<div className="space-y-4">
											{dashboardData.appliedJobs && dashboardData.appliedJobs.length > 0 ? (
												dashboardData.appliedJobs.map(application => (
													<ApplicationCard key={application.id} application={application} />
												))
											) : (
												<div className="text-center py-8 text-gray-500">
													<p>No job applications yet</p>
													<button 
														onClick={() => setActiveTab('jobs')}
														className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
													>
														Browse Jobs
													</button>
												</div>
											)}
										</div>
									</div>

									{/* Interviews */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Interviews</h3>
										<div className="space-y-4">
											{dashboardData.interviews && dashboardData.interviews.length > 0 ? (
												dashboardData.interviews.map(interview => (
													<InterviewCard key={interview.id} interview={interview} />
												))
											) : (
												<div className="text-center py-8 text-gray-500">
													<p>No interviews scheduled</p>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Bottom Row */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Job Offers */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Job Offers</h3>
										<div className="space-y-4">
											{dashboardData.offers && dashboardData.offers.length > 0 ? (
												dashboardData.offers.map(offer => (
													<OfferCard key={offer.id} offer={offer} />
												))
											) : (
												<div className="text-center py-8 text-gray-500">
													<p>No job offers yet</p>
												</div>
											)}
										</div>
									</div>

									{/* Notifications */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
										<div className="space-y-4">
											{dashboardData.notifications && dashboardData.notifications.length > 0 ? (
												dashboardData.notifications.map(notification => (
													<NotificationCard key={notification.id} notification={notification} />
												))
											) : (
												<div className="text-center py-8 text-gray-500">
													<p>No notifications</p>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Quick Actions */}
								<div className="bg-white rounded-lg shadow p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<button 
											onClick={() => setShowJobSearch(true)}
											className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
										>
											<div className="text-center">
												<div className="text-2xl mb-2">🔍</div>
												<div className="text-sm font-medium">Browse Jobs</div>
											</div>
										</button>
										<button 
											onClick={() => setShowResumeUpload(true)}
											className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
										>
											<div className="text-center">
												<div className="text-2xl mb-2">📄</div>
												<div className="text-sm font-medium">Upload Resume</div>
											</div>
										</button>
										<button 
											onClick={() => setShowProfileModal(true)}
											className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
										>
											<div className="text-center">
												<div className="text-2xl mb-2">✏️</div>
												<div className="text-sm font-medium">Update Profile</div>
											</div>
										</button>
										<button 
											onClick={() => setActiveTab('analytics')}
											className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
										>
											<div className="text-center">
												<div className="text-2xl mb-2">📊</div>
												<div className="text-sm font-medium">View Analytics</div>
											</div>
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Job Search Tab */}
						{activeTab === 'jobs' && (
							<div className="space-y-6">
								<div className="bg-white rounded-lg shadow p-6">
									<div className="flex justify-between items-center mb-6">
										<h3 className="text-xl font-semibold text-gray-900">Job Search</h3>
										<button 
											onClick={() => setShowJobSearch(true)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Advanced Search
										</button>
									</div>
									
									{/* Quick Search */}
									<div className="flex gap-4 mb-6">
										<input
											type="text"
											placeholder="Search jobs by title, company, or skills..."
											className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
											Search
										</button>
									</div>

									{/* Job Listings */}
									<div className="space-y-4">
										{mockJobs.map(job => (
											<div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
															{job.skills.map(skill => (
																<span key={skill} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
																	{skill}
																</span>
															))}
														</div>
														<p className="text-sm text-gray-600 mt-2">{job.description}</p>
													</div>
													<div className="ml-4 flex flex-col gap-2">
														<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
															Apply Now
														</button>
														<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
															Save Job
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Profile Tab */}
						{activeTab === 'profile' && (
							<div className="space-y-6">
								<div className="bg-white rounded-lg shadow p-6">
									<div className="flex justify-between items-center mb-6">
										<h3 className="text-xl font-semibold text-gray-900">Profile Management</h3>
										<button 
											onClick={() => setShowProfileModal(true)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Edit Profile
										</button>
									</div>
									
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
										{/* Personal Information */}
										<div>
											<h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">Full Name</label>
													<p className="mt-1 text-sm text-gray-900">{user?.fullName || 'Not provided'}</p>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">Email</label>
													<p className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</p>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">Experience</label>
													<p className="mt-1 text-sm text-gray-900">{dashboardData?.candidate?.experienceYears || 0} years</p>
												</div>
											</div>
										</div>

										{/* Skills */}
										<div>
											<h4 className="text-lg font-medium text-gray-900 mb-4">Skills</h4>
											<div className="flex flex-wrap gap-2">
												{mockSkills.slice(0, 5).map(skill => (
													<span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
														{skill}
													</span>
												))}
											</div>
										</div>
									</div>

									{/* Resume Section */}
									<div className="mt-8">
										<h4 className="text-lg font-medium text-gray-900 mb-4">Resume</h4>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
											<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
												<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
											</svg>
											<p className="mt-2 text-sm text-gray-600">No resume uploaded</p>
											<button 
												onClick={() => setShowResumeUpload(true)}
												className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
											>
												Upload Resume
											</button>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Analytics Tab */}
						{activeTab === 'analytics' && (
							<div className="space-y-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<AnalyticsCard
										title="Application Statistics"
										data={[
											{ label: 'Total Applications', value: dashboardData?.appliedJobs?.length || 0 },
											{ label: 'Shortlisted', value: 2 },
											{ label: 'Interviewed', value: 1 },
											{ label: 'Offers Received', value: dashboardData?.offers?.length || 0 }
										]}
									/>
									<AnalyticsCard
										title="Response Rate"
										data={[
											{ label: 'Application Response Rate', value: '75%' },
											{ label: 'Interview Conversion', value: '50%' },
											{ label: 'Offer Acceptance', value: '100%' }
										]}
									/>
								</div>
								
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<AnalyticsCard
										title="Application Timeline"
										type="chart"
									/>
									<AnalyticsCard
										title="Skills Match"
										data={[
											{ label: 'React', value: '90%' },
											{ label: 'JavaScript', value: '85%' },
											{ label: 'Node.js', value: '80%' },
											{ label: 'Python', value: '70%' }
										]}
									/>
								</div>
							</div>
						)}

						{/* Modals */}
						{showJobSearch && <JobSearchModal />}
						{showProfileModal && <ProfileModal />}
						{showResumeUpload && <ResumeUploadModal />}
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
