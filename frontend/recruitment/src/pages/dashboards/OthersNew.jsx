import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import OthersOverview from '../../components/others/OthersOverview.jsx';
import CandidateManagement from '../../components/others/CandidateManagement.jsx';
import JobManagement from '../../components/others/JobManagement.jsx';
import InterviewManagement from '../../components/others/InterviewManagement.jsx';
import Reports from '../../components/others/Reports.jsx';
import JobModal from '../../components/others/JobModal.jsx';
import CandidateModal from '../../components/others/CandidateModal.jsx';
import InterviewModal from '../../components/others/InterviewModal.jsx';
import FeedbackModal from '../../components/others/FeedbackModal.jsx';
import DeleteConfirmModal from '../../components/others/DeleteConfirmModal.jsx';

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

export default function OthersNew() {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');

	// Modal states
	const [showJobModal, setShowJobModal] = useState(false);
	const [showCandidateModal, setShowCandidateModal] = useState(false);
	const [showInterviewModal, setShowInterviewModal] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Form states
	const [jobForm, setJobForm] = useState({
		title: '',
		department: 'Engineering',
		location: '',
		minExperience: '1-3 years',
		description: '',
		status: 'Open',
		selectedCandidateId: null,
		closedReason: '',
		skillIds: []
	});

	const [interviewForm, setInterviewForm] = useState({
		candidateId: '',
		jobId: '',
		scheduledDate: '',
		scheduledTime: '',
		interviewType: 'Technical',
		roundNo: 1,
		interviewerIds: [],
		notes: ''
	});

	const [feedbackForm, setFeedbackForm] = useState({
		interviewerId: '',
		rating: '',
		comments: ''
	});

	// Data states
	const [jobs, setJobs] = useState([]);
	const [candidates, setCandidates] = useState([]);
	const [interviews, setInterviews] = useState([]);
	const [skills, setSkills] = useState([]);
	const [interviewers, setInterviewers] = useState([]);

	// Selected items
	const [editingJob, setEditingJob] = useState(null);
	const [selectedCandidate, setSelectedCandidate] = useState(null);
	const [selectedInterview, setSelectedInterview] = useState(null);
	const [jobToDelete, setJobToDelete] = useState(null);

	// Loading states
	const [interviewLoading, setInterviewLoading] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [schedulingInterview, setSchedulingInterview] = useState(false);
	const [submittingFeedback, setSubmittingFeedback] = useState(false);
	const [deletingJob, setDeletingJob] = useState(false);

	useEffect(() => {
		loadDashboardData();
		loadJobs();
		loadCandidates();
		loadInterviews();
		loadSkills();
		loadInterviewers();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const data = await apiRequest('/dashboard/others');
			setDashboardData(data);
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadJobs = async () => {
		try {
			const data = await apiRequest('/jobs');
			setJobs(data);
		} catch (error) {
			console.error('Failed to load jobs:', error);
		}
	};

	const loadCandidates = async () => {
		try {
			const data = await apiRequest('/candidates');
			setCandidates(data);
		} catch (error) {
			console.error('Failed to load candidates:', error);
		}
	};

	const loadInterviews = async () => {
		try {
			setInterviewLoading(true);
			const data = await apiRequest('/interviews');
			setInterviews(data);
		} catch (error) {
			console.error('Failed to load interviews:', error);
		} finally {
			setInterviewLoading(false);
		}
	};

	const loadSkills = async () => {
		try {
			const data = await apiRequest('/skills');
			setSkills(data);
		} catch (error) {
			console.error('Failed to load skills:', error);
		}
	};

	const loadInterviewers = async () => {
		try {
			const data = await apiRequest('/users/interviewers');
			setInterviewers(data);
		} catch (error) {
			console.error('Failed to load interviewers:', error);
		}
	};

	const handleJobSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingJob) {
				await apiRequest(`/jobs/${editingJob.id}`, {
					method: 'PUT',
					body: JSON.stringify(jobForm)
				});
			} else {
				await apiRequest('/jobs', {
					method: 'POST',
					body: JSON.stringify(jobForm)
				});
			}
			setShowJobModal(false);
			setEditingJob(null);
			setJobForm({
				title: '',
				department: 'Engineering',
				location: '',
				minExperience: '1-3 years',
				description: '',
				status: 'Open',
				selectedCandidateId: null,
				closedReason: '',
				skillIds: []
			});
			loadJobs();
		} catch (error) {
			console.error('Failed to save job:', error);
		}
	};

	const handleScheduleInterview = async (e) => {
		e.preventDefault();
		try {
			setSchedulingInterview(true);
			// Combine scheduledDate and scheduledTime into ScheduledDate
			const scheduledDateTime = interviewForm.scheduledDate && interviewForm.scheduledTime
				? `${interviewForm.scheduledDate}T${interviewForm.scheduledTime}:00`
				: null;

			const payload = {
				CandidateId: interviewForm.candidateId,
				JobId: interviewForm.jobId,
				ScheduledDate: scheduledDateTime,
				InterviewType: interviewForm.interviewType,
				RoundNo: interviewForm.roundNo,
				InterviewerIds: interviewForm.interviewerIds
			};

			await apiRequest('/interviews/schedule', {
				method: 'POST',
				body: JSON.stringify(payload)
			});
			setShowInterviewModal(false);
			setInterviewForm({
				candidateId: '',
				jobId: '',
				scheduledDate: '',
				scheduledTime: '',
				interviewType: 'Technical',
				roundNo: 1,
				interviewerIds: [],
				notes: ''
			});
			loadInterviews();
		} catch (error) {
			console.error('Failed to schedule interview:', error);
		} finally {
			setSchedulingInterview(false);
		}
	};

	const handleFeedbackSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmittingFeedback(true);
			await apiRequest(`/interviews/${selectedInterview.id}/feedback`, {
				method: 'POST',
				body: JSON.stringify(feedbackForm)
			});
			setShowFeedbackModal(false);
			setFeedbackForm({
				interviewerId: '',
				rating: '',
				comments: ''
			});
			loadInterviews();
		} catch (error) {
			console.error('Failed to submit feedback:', error);
		} finally {
			setSubmittingFeedback(false);
		}
	};

	const handleStatusUpdate = async (interviewId, status) => {
		try {
			setUpdatingStatus(true);
			await apiRequest(`/interviews/${interviewId}/status`, {
				method: 'PUT',
				body: JSON.stringify({ status })
			});
			loadInterviews();
		} catch (error) {
			console.error('Failed to update interview status:', error);
		} finally {
			setUpdatingStatus(false);
		}
	};

	const handleDeleteJob = (jobId) => {
		const job = jobs.find(j => j.id === jobId);
		setJobToDelete(job);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			setDeletingJob(true);
			await apiRequest(`/jobs/${jobToDelete.id}`, {
				method: 'DELETE'
			});
			setShowDeleteModal(false);
			setJobToDelete(null);
			loadJobs();
		} catch (error) {
			console.error('Failed to delete job:', error);
		} finally {
			setDeletingJob(false);
		}
	};

	const handleJobModalClose = () => {
		setShowJobModal(false);
		setEditingJob(null);
		setJobForm({
			title: '',
			department: 'Engineering',
			location: '',
			minExperience: '1-3 years',
			description: '',
			status: 'Open',
			selectedCandidateId: null,
			closedReason: '',
			skillIds: []
		});
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 'overview':
				return <OthersOverview
					dashboardData={dashboardData}
					user={user}
					setShowJobModal={setShowJobModal}
					setShowCandidateModal={setShowCandidateModal}
					setShowInterviewModal={setShowInterviewModal}
					setShowFeedbackModal={setShowFeedbackModal}
				/>;
			case 'candidates':
				return <CandidateManagement
					candidates={candidates}
					setSelectedCandidate={setSelectedCandidate}
					setShowCandidateModal={setShowCandidateModal}
				/>;
			case 'jobs':
				return <JobManagement
					jobs={jobs}
					setEditingJob={setEditingJob}
					setShowJobModal={setShowJobModal}
					handleDeleteJob={handleDeleteJob}
				/>;
			case 'interviews':
				return <InterviewManagement
					interviews={interviews}
					interviewLoading={interviewLoading}
					handleStatusUpdate={handleStatusUpdate}
					updatingStatus={updatingStatus}
					setSelectedInterview={setSelectedInterview}
					setShowInterviewModal={setShowInterviewModal}
					setShowFeedbackModal={setShowFeedbackModal}
				/>;
			case 'reports':
				return <Reports />;
			default:
				return <OthersOverview
					dashboardData={dashboardData}
					user={user}
					setShowJobModal={setShowJobModal}
					setShowCandidateModal={setShowCandidateModal}
					setShowInterviewModal={setShowInterviewModal}
					setShowFeedbackModal={setShowFeedbackModal}
				/>;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Recruitment Dashboard</h1>
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
				) : (
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
						{renderTabContent()}
					</div>
				)}
			</div>

			{/* Modals */}
			<JobModal
				showJobModal={showJobModal}
				handleJobModalClose={handleJobModalClose}
				editingJob={editingJob}
				jobForm={jobForm}
				setJobForm={setJobForm}
				handleJobSubmit={handleJobSubmit}
				skills={skills}
				candidates={candidates}
			/>

			<CandidateModal
				showCandidateModal={showCandidateModal}
				setShowCandidateModal={setShowCandidateModal}
				selectedCandidate={selectedCandidate}
				setShowInterviewModal={setShowInterviewModal}
			/>

			<InterviewModal
				showInterviewModal={showInterviewModal}
				setShowInterviewModal={setShowInterviewModal}
				interviewForm={interviewForm}
				setInterviewForm={setInterviewForm}
				handleScheduleInterview={handleScheduleInterview}
				schedulingInterview={schedulingInterview}
				candidates={candidates}
				jobs={jobs}
				interviewers={interviewers}
			/>

			<FeedbackModal
				showFeedbackModal={showFeedbackModal}
				setShowFeedbackModal={setShowFeedbackModal}
				selectedInterview={selectedInterview}
				feedbackForm={feedbackForm}
				setFeedbackForm={setFeedbackForm}
				handleFeedbackSubmit={handleFeedbackSubmit}
				submittingFeedback={submittingFeedback}
				interviewers={interviewers}
			/>

			<DeleteConfirmModal
				showDeleteModal={showDeleteModal}
				setShowDeleteModal={setShowDeleteModal}
				jobToDelete={jobToDelete}
				handleDeleteConfirm={handleDeleteConfirm}
				deletingJob={deletingJob}
			/>
		</div>
	);
}
