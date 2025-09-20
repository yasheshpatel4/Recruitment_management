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

export default function Admin() {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [pendingUsers, setPendingUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');

	useEffect(() => {
		loadDashboardData();
		loadUsers();
	}, []);

	const loadDashboardData = async () => {
		try {
			const data = await apiRequest('/dashboard/admin');
			setDashboardData(data);
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		}
	};

	const loadUsers = async () => {
		try {
			const [pendingData, allData] = await Promise.all([
				apiRequest('/admin/pending-users'),
				apiRequest('/admin/all-users')
			]);
			setPendingUsers(pendingData);
			setAllUsers(allData);
		} catch (error) {
			console.error('Failed to load users:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUserAction = async (userId, action) => {
		try {
			await apiRequest('/admin/approve-user', {
				method: 'POST',
				body: JSON.stringify({ userId, action })
			});
			alert(`User ${action}d successfully`);
			loadUsers();
		} catch (error) {
			alert('Failed to update user: ' + error.message);
		}
	};

	const handleDeleteUser = async (userId) => {
		if (!window.confirm('Are you sure you want to delete this user?')) return;
		
		try {
			await apiRequest(`/admin/user/${userId}`, {
				method: 'DELETE'
			});
			alert('User deleted successfully');
			loadUsers();
		} catch (error) {
			alert('Failed to delete user: ' + error.message);
		}
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

	const UserCard = ({ user, showActions = true }) => (
		<div className="bg-white border rounded-lg p-4 shadow-sm">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h3 className="font-semibold text-lg">{user.fullName}</h3>
					<p className="text-gray-600">@{user.username}</p>
					<p className="text-sm text-gray-500">{user.email}</p>
					<div className="flex gap-2 mt-2">
						{user.roles.map(role => (
							<span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
								{role}
							</span>
						))}
					</div>
					<p className="text-sm text-gray-500 mt-2">
						Status: <span className={`font-medium ${user.status === 'Active' ? 'text-green-600' : user.status === 'PendingApproval' ? 'text-yellow-600' : 'text-red-600'}`}>
							{user.status}
						</span>
					</p>
					<p className="text-xs text-gray-400">
						Joined: {new Date(user.createdAt).toLocaleDateString()}
					</p>
				</div>
				{showActions && user.status === 'PendingApproval' && (
					<div className="flex gap-2 ml-4">
						<button
							onClick={() => handleUserAction(user.id, 'approve')}
							className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
						>
							Approve
						</button>
						<button
							onClick={() => handleUserAction(user.id, 'reject')}
							className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
						>
							Reject
						</button>
					</div>
				)}
				{showActions && user.status !== 'PendingApproval' && !user.roles.includes('Admin') && (
					<button
						onClick={() => handleDeleteUser(user.id)}
						className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 ml-4"
					>
						Delete
					</button>
				)}
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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
				{/* Tabs */}
				<div className="mb-8">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8">
							<button
								onClick={() => setActiveTab('overview')}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === 'overview'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Overview
							</button>
							<button
								onClick={() => setActiveTab('users')}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === 'users'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								User Management
							</button>
						</nav>
					</div>
				</div>

				{loading ? (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading dashboard...</p>
					</div>
				) : (
					<>
						{activeTab === 'overview' && dashboardData && (
							<div className="space-y-8">
								{/* Stats Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									<StatCard
										title="Total Jobs"
										value={dashboardData.stats.totalJobs}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>}
										color="bg-blue-500"
									/>
									<StatCard
										title="Total Candidates"
										value={dashboardData.stats.totalCandidates}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
										color="bg-green-500"
									/>
									<StatCard
										title="Scheduled Interviews"
										value={dashboardData.stats.scheduledInterviews}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
										color="bg-yellow-500"
									/>
									<StatCard
										title="Pending Offers"
										value={dashboardData.stats.pendingOffers}
										icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
										color="bg-purple-500"
									/>
								</div>

								{/* Main Content Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
									{/* Recent Jobs */}
									<div className="lg:col-span-1">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
										<div className="space-y-4">
											{dashboardData.recentJobs?.slice(0, 5).map(job => (
												<RecentItemCard key={job.id} item={job} type="job" />
											))}
										</div>
									</div>

									{/* Recent Candidates */}
									<div className="lg:col-span-1">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidates</h3>
										<div className="space-y-4">
											{dashboardData.recentCandidates?.slice(0, 5).map(candidate => (
												<RecentItemCard key={candidate.id} item={candidate} type="candidate" />
											))}
										</div>
									</div>

									{/* Upcoming Interviews */}
									<div className="lg:col-span-1">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
										<div className="space-y-4">
											{dashboardData.upcomingInterviews?.slice(0, 5).map(interview => (
												<RecentItemCard key={interview.id} item={interview} type="interview" />
											))}
										</div>
									</div>
								</div>

								{/* Bottom Row */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Pending Tasks */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
										<div className="space-y-4">
											{dashboardData.pendingTasks?.slice(0, 5).map(task => (
												<PendingTaskCard key={task.id} task={task} />
											))}
										</div>
									</div>

									{/* Notifications */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
										<div className="space-y-4">
											{dashboardData.notifications?.slice(0, 5).map(notification => (
												<NotificationCard key={notification.id} notification={notification} />
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'users' && (
							<div className="space-y-6">
								{/* User Management Tabs */}
								<div className="border-b border-gray-200">
									<nav className="-mb-px flex space-x-8">
										<button
											onClick={() => setActiveTab('pending')}
											className={`py-2 px-1 border-b-2 font-medium text-sm ${
												activeTab === 'pending'
													? 'border-blue-500 text-blue-600'
													: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
											}`}
										>
											Pending Approval ({pendingUsers.length})
										</button>
										<button
											onClick={() => setActiveTab('all')}
											className={`py-2 px-1 border-b-2 font-medium text-sm ${
												activeTab === 'all'
													? 'border-blue-500 text-blue-600'
													: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
											}`}
										>
											All Users ({allUsers.length})
										</button>
									</nav>
								</div>

								{/* User List */}
								<div className="space-y-4">
									{activeTab === 'pending' ? (
										pendingUsers.length === 0 ? (
											<div className="text-center py-8 text-gray-500">
												No users pending approval
											</div>
										) : (
											pendingUsers.map(user => (
												<UserCard key={user.id} user={user} showActions={true} />
											))
										)
									) : (
										allUsers.length === 0 ? (
											<div className="text-center py-8 text-gray-500">
												No users found
											</div>
										) : (
											allUsers.map(user => (
												<UserCard key={user.id} user={user} showActions={true} />
											))
										)
									)}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
