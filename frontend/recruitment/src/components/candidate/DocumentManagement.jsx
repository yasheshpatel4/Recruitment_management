import React, { useState, useEffect } from 'react';
import DocumentUploadModal from '../../components/DocumentUploadModal.jsx';
import DocumentList from '../../components/DocumentList.jsx';

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

const DocumentManagement = () => {
	const [documents, setDocuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showUploadModal, setShowUploadModal] = useState(false);

	useEffect(() => {
		loadDocuments();
	}, []);

	const loadDocuments = async () => {
		try {
			setLoading(true);
			const data = await apiRequest('/candidate/documents');
			setDocuments(data || []);
		} catch (error) {
			console.error('Failed to load documents:', error);
			setError('Failed to load documents');
		} finally {
			setLoading(false);
		}
	};

	const handleDocumentUploaded = () => {
		setShowUploadModal(false);
		loadDocuments();
	};

	const handleDocumentDeleted = () => {
		loadDocuments();
	};

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-lg font-semibold text-gray-900">Document Management</h3>
					<button
						onClick={() => setShowUploadModal(true)}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Upload Document
					</button>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading documents...</p>
					</div>
				) : (
					<DocumentList
						documents={documents}
						onDelete={handleDocumentDeleted}
						onUpload={() => setShowUploadModal(true)}
					/>
				)}
			</div>

			<DocumentUploadModal
				isOpen={showUploadModal}
				onClose={() => setShowUploadModal(false)}
				onUploadSuccess={handleDocumentUploaded}
			/>
		</div>
	);
};

export default DocumentManagement;
