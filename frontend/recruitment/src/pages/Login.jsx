import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function getRoute(roles) {
	const priority = ['Admin','HR','Recruiter','Interviewer','Reviewer','Candidate'];
	const top = priority.find(r => roles.includes(r));
	switch (top) {
		case 'Admin': return '/admin';
		case 'Candidate': return '/candidate';
		default: return '/others';
	}
}

export default function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		const res = await login(username, password);
		if (res.ok) {
			navigate(getRoute(res.user.roles || []), { replace: true });
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="w-full max-w-md bg-white rounded-md shadow p-6">
				<h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Username</label>
						<input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} required />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Password</label>
						<input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
					</div>
					<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Sign In</button>
				</form>
				<p className="text-sm text-center mt-3">No account? <Link className="text-blue-600" to="/register">Register</Link></p>
			</div>
		</div>
	);
}
