import React from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function Candidate() {
	const { user, logout } = useAuth();
	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Candidate Dashboard</h1>
				<button onClick={logout} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
			</div>
			<div className="bg-white shadow rounded p-4">
				<p>Welcome, {user?.fullName || user?.username}</p>
				<p className="text-sm text-gray-600 mt-2">You cannot change your own CandidateStatus. Only internal roles can update it.</p>
			</div>
		</div>
	);
}
