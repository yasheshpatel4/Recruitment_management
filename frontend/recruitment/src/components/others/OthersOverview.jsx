import React from 'react';

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

export default function OthersOverview({
	dashboardData,
	user,
	setShowJobModal,
	setShowCandidateModal,
	setShowInterviewModal,
	setShowFeedbackModal
}) {
	const getRoleSpecificStats = () => {
		if (!dashboardData?.stats) return [];

		const stats = dashboardData.stats;
		const role = user?.roles?.[0];

		if (role === 'HR') {
			return [
				{ title: 'Total Candidates', value: stats.totalCandidates || 0, icon: '👥', color: 'bg-blue-500' },
				{ title: 'Scheduled Interviews', value: stats.scheduledInterviews || 0, icon: '📅', color: 'bg-yellow-500' },
				{ title: 'Pending Offers', value: stats.pendingOffers || 0, icon: '📋', color: 'bg-purple-500' },
				{ title: 'Selected Candidates', value: stats.selectedCandidates || 0, icon: '✅', color: 'bg-green-500' }
			];
		} else if (role === 'Recruiter') {
			return [
				{ title: 'Total Jobs', value: stats.totalJobs || 0, icon: '💼', color: 'bg-blue-500' },
				{ title: 'Open Jobs', value: stats.openJobs || 0, icon: '🔓', color: 'bg-green-500' },
				{ title: 'Total Candidates', value: stats.totalCandidates || 0, icon: '👥', color: 'bg-purple-500' },
				{ title: 'Applied Candidates', value: stats.appliedCandidates || 0, icon: '📝', color: 'bg-yellow-500' }
			];
		} else if (role === 'Interviewer') {
			return [
				{ title: 'My Interviews', value: stats.scheduledInterviews || 0, icon: '🎯', color: 'bg-blue-500' },
				{ title: 'Completed', value: stats.completedInterviews || 0, icon: '✅', color: 'bg-green-500' },
				{ title: 'Pending', value: stats.pendingInterviews || 0, icon: '⏳', color: 'bg-yellow-500' },
				{ title: 'Total Candidates', value: stats.totalCandidates || 0, icon: '👥', color: 'bg-purple-500' }
			];
		} else if (role === 'Reviewer') {
			return [
				{ title: 'Total Candidates', value: stats.totalCandidates || 0, icon: '👥', color: 'bg-blue-500' },
				{ title: 'Applied', value: stats.appliedCandidates || 0, icon: '📝', color: 'bg-yellow-500' },
				{ title: 'Shortlisted', value: stats.shortlistedCandidates || 0, icon: '⭐', color: 'bg-green-500' },
				{ title: 'Rejected', value: stats.rejectedCandidates || 0, icon: '❌', color: 'bg-red-500' }
			];
		}

		return [];
	};

	return (
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
				{dashboardData?.recentCandidates && dashboardData.recentCandidates.length > 0 && (
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
				{dashboardData?.recentJobs && dashboardData.recentJobs.length > 0 && user?.roles?.includes('Recruiter') && (
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
				{dashboardData?.upcomingInterviews && dashboardData.upcomingInterviews.length > 0 && (
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
				{dashboardData?.pendingTasks && dashboardData.pendingTasks.length > 0 && (
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
				{dashboardData?.notifications && dashboardData.notifications.length > 0 && (
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
	);
}
