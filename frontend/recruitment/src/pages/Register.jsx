import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const ROLES = ['Admin','HR','Recruiter','Interviewer','Reviewer','Candidate'];

export default function Register() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [roles, setRoles] = useState(['Candidate']);

	const toggleRole = (role) => setRoles(prev => prev.includes(role) ? prev.filter(r=>r!==role) : [...prev, role]);

	const onSubmit = (e) => {
		e.preventDefault();
		if (!roles.length) { alert('Select at least one role'); return; }
		const res = register({ fullName, email, username, password, roles });
		if (res.ok) navigate('/login', { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<div className="w-full max-w-xl bg-white rounded-md shadow p-6">
				<h1 className="text-2xl font-semibold text-center mb-4">Register</h1>
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Full Name</label>
							<input className="w-full border rounded px-3 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} required />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Email</label>
							<input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Username</label>
							<input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} required />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Password</label>
							<input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Select Roles</label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{ROLES.map(role => (
								<label key={role} className="flex items-center gap-2 border rounded px-2 py-1">
									<input type="checkbox" checked={roles.includes(role)} onChange={()=>toggleRole(role)} />
									<span>{role}</span>
								</label>
							))}
						</div>
						<p className="text-xs text-gray-600 mt-2">Candidates always get Candidate role. Internal users require Admin approval.</p>
					</div>

					<button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Submit</button>
				</form>
				<p className="text-sm text-center mt-3">Have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
			</div>
		</div>
	);
}
