import React from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function Admin() {
	const { user, logout } = useAuth();
	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Admin Dashboard</h1>
				<button onClick={logout} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
			</div>
			<div className="bg-white shadow rounded p-4">
				<p>Welcome, {user?.fullName || user?.username}</p>
			</div>
		</div>
	);
}
