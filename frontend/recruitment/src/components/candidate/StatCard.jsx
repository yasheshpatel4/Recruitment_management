import React from 'react';

const StatCard = ({ title, value, icon, color = 'bg-blue-500', description }) => (
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

export default StatCard;
