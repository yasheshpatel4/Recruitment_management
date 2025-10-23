import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
	const token = localStorage.getItem('rp_token');
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

const ProfileManagement = ({ onProfileUpdate }) => {
	const { user } = useAuth();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState({
		fullName: '',
		email: '',
		phone: '',
		experienceYears: 0,
		bio: '',
		skills: []
	});

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			setLoading(true);
			const data = await apiRequest('/candidate/profile');
			setProfileData(data);
			setEditForm({
				fullName: data.user?.fullName || '',
				email: data.user?.email || '',
				phone: data.phone || '',
				experienceYears: data.experienceYears || 0,
				bio: data.bio || '',
				skills: data.candidateSkills?.map(cs => cs.skill?.name).filter(Boolean) || []
			});
		} catch (error) {
			console.error('Failed to load profile:', error);
			setError('Failed to load profile data');
		} finally {
			setLoading(false);
		}
	};

	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		try {
			setUpdating(true);
			setError('');
			setSuccess('');

			const updateData = {
				fullName: editForm.fullName,
				email: editForm.email,
				phone: editForm.phone,
				experienceYears: editForm.experienceYears,
				bio: editForm.bio,
				skills: editForm.skills
			};

			await apiRequest('/candidate/profile', {
				method: 'PUT',
				body: JSON.stringify(updateData)
			});

			setSuccess('Profile updated successfully!');
			setShowEditModal(false);
			loadProfile();
			if (onProfileUpdate) onProfileUpdate();
		} catch (error) {
			setError(error.message || 'Failed to update profile');
		} finally {
			setUpdating(false);
		}
	};

	const addSkill = (skill) => {
		if (skill && !editForm.skills.includes(skill)) {
			setEditForm({
				...editForm,
				skills: [...editForm.skills, skill]
			});
		}
	};

	const removeSkill = (skillToRemove) => {
		setEditForm({
			...editForm,
			skills: editForm.skills.filter(skill => skill !== skillToRemove)
		});
	};

	const ProfileEditModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Edit Profile</h3>
					<button
						onClick={() => setShowEditModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleProfileUpdate} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								value={editForm.fullName}
								onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								value={editForm.email}
								onChange={(e) => setEditForm({...editForm, email: e.target.value})}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
							<input
								type="tel"
								value={editForm.phone}
								onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
								placeholder="Enter phone number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
							<input
								type="number"
								value={editForm.experienceYears}
								onChange={(e) => setEditForm({...editForm, experienceYears: parseInt(e.target.value) || 0})}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								min="0"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
						<textarea
							rows={4}
							value={editForm.bio}
							onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
							placeholder="Tell us about yourself..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
						<div className="flex flex-wrap gap-2 mb-2">
							{editForm.skills.map(skill => (
								<span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
									{skill}
									<button
										type="button"
										onClick={() => removeSkill(skill)}
										className="ml-2 text-blue-600 hover:text-blue-800"
									>
										×
									</button>
								</span>
							))}
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Add a skill"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addSkill(e.target.value.trim());
										e.target.value = '';
									}
								}}
							/>
							<button
								type="button"
								onClick={(e) => {
									const input = e.target.previousElementSibling;
									addSkill(input.value.trim());
									input.value = '';
								}}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Add
							</button>
						</div>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}
					{success && <p className="text-green-500 text-sm">{success}</p>}

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => setShowEditModal(false)}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={updating}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{updating ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p className="mt-2 text-gray-600">Loading profile...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Profile Management</h3>
					<button
						onClick={() => setShowEditModal(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Edit Profile
					</button>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{success && (
					<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
						{success}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Personal Information */}
					<div>
						<h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Full Name</label>
								<p className="mt-1 text-sm text-gray-900">{profileData?.user?.fullName || 'Not provided'}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Email</label>
								<p className="mt-1 text-sm text-gray-900">{profileData?.user?.email || 'Not provided'}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Phone</label>
								<p className="mt-1 text-sm text-gray-900">{profileData?.phone || 'Not provided'}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Experience</label>
								<p className="mt-1 text-sm text-gray-900">{profileData?.experienceYears || 0} years</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Bio</label>
								<p className="mt-1 text-sm text-gray-900">{profileData?.bio || 'Not provided'}</p>
							</div>
						</div>
					</div>

					{/* Skills */}
					<div>
						<h4 className="text-lg font-medium text-gray-900 mb-4">Skills</h4>
						<div className="flex flex-wrap gap-2">
							{profileData?.candidateSkills && profileData.candidateSkills.length > 0 ? (
								profileData.candidateSkills.map(cs => cs.skill?.name).filter(Boolean).map(skill => (
									<span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
										{skill}
									</span>
								))
							) : (
								<p className="text-sm text-gray-500">No skills added yet</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{showEditModal && <ProfileEditModal />}
		</div>
	);
};

export default ProfileManagement;
