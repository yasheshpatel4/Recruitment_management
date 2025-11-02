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

export default function Reports() {
	const [reportsData, setReportsData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadReportsData();
	}, []);

	const loadReportsData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiRequest('/reports/overview');
			setReportsData(data);
		} catch (error) {
			console.error('Failed to load reports data:', error);
			setError('Failed to load reports. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p className="mt-2 text-gray-600">Loading reports...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<div className="text-red-600 mb-4">{error}</div>
				<button
					onClick={loadReportsData}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Analytics</h3>
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Total Applications</span>
							<span className="text-lg font-semibold">{reportsData?.totalApplications || 0}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Interview Rate</span>
							<span className="text-lg font-semibold">{reportsData?.interviewRate || 0}%</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Hire Rate</span>
							<span className="text-lg font-semibold">{reportsData?.hireRate || 0}%</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Time to Hire</span>
							<span className="text-lg font-semibold">{reportsData?.timeToHire || 0} days</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Source Analysis</h3>
					<div className="space-y-3">
						{reportsData?.sourceAnalysis?.map((source, index) => (
							<div key={index} className="flex justify-between items-center">
								<span className="text-sm text-gray-600">{source.source}</span>
								<span className="text-sm font-medium">{source.percentage}%</span>
							</div>
						)) || (
							<div className="text-center py-4 text-gray-500">
								No source data available
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
				<div className="space-y-3">
					{reportsData?.recentActivity?.map((activity, index) => (
						<div key={index} className="flex items-center space-x-3">
							<div className={`w-2 h-2 rounded-full ${
								activity.type === 'application' ? 'bg-green-500' :
								activity.type === 'interview' ? 'bg-blue-500' :
								activity.type === 'shortlist' ? 'bg-yellow-500' :
								'bg-gray-500'
							}`}></div>
							<span className="text-sm text-gray-600">{activity.description}</span>
							<span className="text-xs text-gray-500">{activity.timeAgo}</span>
						</div>
					)) || (
						<div className="text-center py-4 text-gray-500">
							No recent activity available
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
