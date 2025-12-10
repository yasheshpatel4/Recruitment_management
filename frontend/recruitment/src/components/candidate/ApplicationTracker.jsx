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

const ApplicationTracker = () => {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

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
			setError('Failed to load application data');
		} finally {
			setLoading(false);
		}
	};

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
						{offer.status === 'Selected' ? 'Selection Date: ' : 'Offer Date: '}
						{new Date(offer.offerDate).toLocaleDateString()}
						{offer.joiningDate && ` • Joining: ${new Date(offer.joiningDate).toLocaleDateString()}`}
					</p>
					<div className="flex items-center mt-2">
						<span className={`px-2 py-1 text-xs rounded-full ${
							offer.status === 'Offered' ? 'bg-blue-100 text-blue-800' :
							offer.status === 'Accepted' ? 'bg-green-100 text-green-800' :
							offer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
							offer.status === 'Joined' ? 'bg-purple-100 text-purple-800' :
							offer.status === 'Selected' ? 'bg-green-100 text-green-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{offer.status}
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p className="mt-2 text-gray-600">Loading applications...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<div className="text-red-500">{error}</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Applications Section */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">Job Applications</h3>
				<div className="space-y-4">
					{dashboardData?.appliedJobs && dashboardData.appliedJobs.length > 0 ? (
						dashboardData.appliedJobs.map(application => (
							<ApplicationCard key={application.id} application={application} />
						))
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>No job applications yet</p>
						</div>
					)}
				</div>
			</div>

			{/* Interviews Section */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">Interviews</h3>
				<div className="space-y-4">
					{dashboardData?.interviews && dashboardData.interviews.length > 0 ? (
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

			{/* Offers Section */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">Job Offers</h3>
				<div className="space-y-4">
					{dashboardData?.offers && dashboardData.offers.length > 0 ? (
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
		</div>
	);
};

export default ApplicationTracker;
