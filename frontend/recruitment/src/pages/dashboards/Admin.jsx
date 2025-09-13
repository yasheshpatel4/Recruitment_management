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
	const [pendingUsers, setPendingUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('pending');

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const [pendingData, allData] = await Promise.all([
				apiRequest('/admin/pending-users'),
				apiRequest('/admin/all-users')
			]);
			setPendingUsers(pendingData);
			setAllUsers(allData);
		} catch (error) {
			alert('Failed to load users: ' + error.message);
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
			loadUsers(); // Reload the list
		} catch (error) {
			alert('Failed to update user: ' + error.message);
		}
	};

	const handleDeleteUser = async (userId) => {
		if (!confirm('Are you sure you want to delete this user?')) return;
		
		try {
			await apiRequest(`/admin/user/${userId}`, {
				method: 'DELETE'
			});
			alert('User deleted successfully');
			loadUsers(); // Reload the list
		} catch (error) {
			alert('Failed to delete user: ' + error.message);
		}
	};

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

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
					<div className="flex items-center gap-4">
						<span className="text-gray-600">Welcome, {user?.fullName || user?.username}</span>
						<button 
							onClick={logout} 
							className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
						>
							Logout
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="mb-6">
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
				</div>

				{/* Content */}
				{loading ? (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading users...</p>
					</div>
				) : (
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
				)}
			</div>
		</div>
	);
}
