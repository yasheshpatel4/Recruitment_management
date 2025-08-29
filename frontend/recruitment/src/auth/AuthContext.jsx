import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rp_user';

function readUser() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function writeUser(user) {
	if (!user) localStorage.removeItem(STORAGE_KEY);
	else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => readUser());
	useEffect(() => { writeUser(user); }, [user]);

	const login = (username, password) => {
		const existing = readUser();
		if (existing && existing.username === username && existing.password === password) {
			alert(`Welcome ${existing.fullName || existing.username}`);
			setUser(existing);
			return { ok: true, user: existing };
		}
		alert('Invalid credentials');
		return { ok: false };
	};

	const register = ({ fullName, email, username, password, roles }) => {
		const isCandidate = roles.includes('Candidate');
		const internalRoles = roles.filter(r => r !== 'Candidate');
		const newUser = {
			userId: Date.now(), fullName, email, username, password,
			roles: isCandidate ? ['Candidate', ...internalRoles] : internalRoles,
			status: internalRoles.length ? 'PendingApproval' : 'Active',
			createdAt: new Date().toISOString(),
		};
		if (internalRoles.length) alert('Registration pending admin approval');
		else alert('Registered successfully');
		setUser(newUser);
		return { ok: true, user: newUser };
	};

	const logout = () => setUser(null);

	const value = useMemo(() => ({ user, login, register, logout }), [user]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
