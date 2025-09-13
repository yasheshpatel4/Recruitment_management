import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rp_user';
const STORAGE_TOKEN = 'rp_token';
const API_BASE_URL = 'http://localhost:5000/api';

function readUser() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function readToken() {
	return localStorage.getItem(STORAGE_TOKEN);
}

function writeUser(user) {
	if (!user) localStorage.removeItem(STORAGE_KEY);
	else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function writeToken(token) {
	if (!token) localStorage.removeItem(STORAGE_TOKEN);
	else localStorage.setItem(STORAGE_TOKEN, token);
}

async function apiRequest(endpoint, options = {}) {
	const token = readToken();
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

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => readUser());
	useEffect(() => { writeUser(user); }, [user]);

	const login = async (username, password) => {
		try {
			const response = await apiRequest('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ username, password }),
			});

			if (response.success) {
				writeToken(response.token);
				setUser(response.user);
				alert(`Welcome ${response.user.fullName || response.user.username}`);
				return { ok: true, user: response.user };
			} else {
				alert(response.message || 'Login failed');
				return { ok: false };
			}
		} catch (error) {
			alert(error.message || 'Login failed');
			return { ok: false };
		}
	};

	const register = async ({ fullName, email, username, password, roles }) => {
		try {
			const response = await apiRequest('/auth/register', {
				method: 'POST',
				body: JSON.stringify({ fullName, email, username, password, roles }),
			});

			if (response.success) {
				alert(response.message || 'Registration successful');
				return { ok: true, user: response.user };
			} else {
				alert(response.message || 'Registration failed');
				return { ok: false };
			}
		} catch (error) {
			alert(error.message || 'Registration failed');
			return { ok: false };
		}
	};

	const logout = () => {
		writeToken(null);
		setUser(null);
	};

	const value = useMemo(() => ({ user, login, register, logout }), [user]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
