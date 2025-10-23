import React from 'react';
import StatCard from './StatCard.jsx';

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

const DashboardOverview = ({ dashboardData, user }) => {
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

	return (
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
								{dashboardData?.candidate?.user?.fullName || user?.fullName || 'Candidate'}
							</h3>
							<p className="text-sm text-gray-600">{dashboardData?.candidate?.user?.email || user?.email}</p>
							<p className="text-sm text-gray-500">
								{dashboardData?.candidate?.experienceYears || 0} years of experience
							</p>
						</div>
					</div>
					<div className="text-right">
						<div className={`text-lg font-semibold ${getStatusColor(dashboardData?.candidate?.status)}`}>
							{dashboardData?.candidate?.status || 'Not Applied'}
						</div>
						<p className="text-sm text-gray-500">
							{getStatusDescription(dashboardData?.candidate?.status)}
						</p>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Applications"
					value={dashboardData?.appliedJobs?.length || 0}
					icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
					color="bg-blue-500"
					description="Total applications submitted"
				/>
				<StatCard
					title="Interviews"
					value={dashboardData?.interviews?.length || 0}
					icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
					color="bg-yellow-500"
					description="Interviews scheduled"
				/>
				<StatCard
					title="Offers"
					value={dashboardData?.offers?.length || 0}
					icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
					color="bg-green-500"
					description="Job offers received"
				/>
				<StatCard
					title="Notifications"
					value={dashboardData?.notifications?.filter(n => !n.isRead).length || 0}
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

				{/* Interviews */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Interviews</h3>
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
			</div>

			{/* Bottom Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Job Offers */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Job Offers</h3>
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

				{/* Notifications */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
					<div className="space-y-4">
						{dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
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
		</div>
	);
};

export default DashboardOverview;
