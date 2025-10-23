import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import DashboardOverview from '../../components/candidate/DashboardOverview.jsx';
import JobSearch from '../../components/candidate/JobSearch.jsx';
import ProfileManagement from '../../components/candidate/ProfileManagement.jsx';
import DocumentManagement from '../../components/candidate/DocumentManagement.jsx';
import ApplicationTracker from '../../components/candidate/ApplicationTracker.jsx';
import NotificationCenter from '../../components/candidate/NotificationCenter.jsx';

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

export default function CandidateNew() {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');

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

	const handleProfileUpdate = () => {
		loadDashboardData();
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case 'overview':
				return <DashboardOverview dashboardData={dashboardData} user={user} />;
			case 'jobs':
				return <JobSearch />;
			case 'profile':
				return <ProfileManagement onProfileUpdate={handleProfileUpdate} />;
			case 'documents':
				return <DocumentManagement />;
			case 'applications':
				return <ApplicationTracker />;
			case 'notifications':
				return <NotificationCenter />;
			default:
				return <DashboardOverview dashboardData={dashboardData} user={user} />;
		}
	};

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
										onClick={() => setActiveTab('documents')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'documents'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Documents
									</button>
									<button
										onClick={() => setActiveTab('applications')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'applications'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Applications
									</button>
									<button
										onClick={() => setActiveTab('notifications')}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === 'notifications'
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}`}
									>
										Notifications
									</button>
								</nav>
							</div>
						</div>

						{/* Tab Content */}
						{renderTabContent()}
					</div>
				)}
			</div>
		</div>
	);
}
