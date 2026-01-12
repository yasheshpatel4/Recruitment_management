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

const NotificationCenter = () => {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadNotifications();
	}, []);

	const loadNotifications = async () => {
		try {
			setLoading(true);
			const data = await apiRequest('/dashboard/candidate');
			setNotifications(data?.notifications || []);
		} catch (error) {
			console.error('Failed to load notifications:', error);
			setError('Failed to load notifications');
		} finally {
			setLoading(false);
		}
	};

	const handleNotificationClick = async (notification) => {
		if (notification.isRead) return; // Already read

		try {
			await apiRequest(`/dashboard/notifications/${notification.id}/read`, {
				method: 'PUT'
			});

			// Update local state
			setNotifications(prevNotifications =>
				prevNotifications.map(n =>
					n.id === notification.id ? { ...n, isRead: true } : n
				)
			);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const NotificationCard = ({ notification }) => (
		<div
			className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}
			onClick={() => handleNotificationClick(notification)}
		>
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

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p className="mt-2 text-gray-600">Loading notifications...</p>
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
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
					<span className="text-sm text-gray-500">
						{notifications.filter(n => !n.isRead).length} unread
					</span>
				</div>

				<div className="space-y-4">
					{notifications.length > 0 ? (
						notifications.map(notification => (
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
	);
};

export default NotificationCenter;
