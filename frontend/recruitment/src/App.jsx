import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/dashboards/Admin.jsx';
import CandidateNew from './pages/dashboards/CandidateNew.jsx';
import Others from './pages/dashboards/Others.jsx';

function ProtectedRoute({ children, roles }) {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	if (roles && roles.length > 0) {
		const ok = user.roles?.some(r => roles.includes(r));
		if (!ok) return <Navigate to={getDefaultRoute(user.roles)} replace />;
	}
	return children;
}

function getDefaultRoute(roles) {
	if (!roles || roles.length === 0) return '/login';
	if (roles.includes('Admin')) return '/admin';
	if (roles.includes('Candidate')) return '/candidate';
	return '/others';
}

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<div className="min-h-screen bg-gray-50">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><Admin /></ProtectedRoute>} />
						<Route path="/candidate" element={<ProtectedRoute roles={["Candidate"]}><CandidateNew /></ProtectedRoute>} />
						<Route path="/others" element={<ProtectedRoute roles={["HR","Recruiter","Interviewer","Reviewer"]}><Others /></ProtectedRoute>} />
						<Route path="*" element={<Navigate to="/login" replace />} />
					</Routes>
				</div>
			</AuthProvider>
		</BrowserRouter>
	);
}
