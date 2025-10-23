import React, { useState, useEffect } from 'react';

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

export default function DocumentList({ documents, onDelete, onUpload }) {
	const [error, setError] = useState('');
	const [deletingId, setDeletingId] = useState(null);
	const [verifyingId, setVerifyingId] = useState(null);

	const handleDeleteDocument = async (documentId) => {
		if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
			return;
		}

		try {
			setDeletingId(documentId);
			await apiRequest(`/candidate/document/${documentId}`, {
				method: 'DELETE'
			});

			// Call parent callback to refresh documents
			if (onDelete) onDelete();
		} catch (error) {
			setError('Failed to delete document');
			console.error('Error deleting document:', error);
			// Refresh the list even on error to ensure UI is up to date
			if (onDelete) onDelete();
		} finally {
			setDeletingId(null);
		}
	};

	const handleVerifyDocument = async (documentId) => {
		try {
			setVerifyingId(documentId);
			await apiRequest(`/candidate/verify-document/${documentId}`, {
				method: 'POST'
			});

			// Call parent callback to refresh documents
			if (onDelete) onDelete();
		} catch (error) {
			setError('Failed to verify document');
			console.error('Error verifying document:', error);
			// Refresh the list even on error to ensure UI is up to date
			if (onDelete) onDelete();
		} finally {
			setVerifyingId(null);
		}
	};

	const getDocumentIcon = (documentType) => {
		switch (documentType.toLowerCase()) {
			case 'cv':
			case 'curriculum vitae':
				return '📄';
			case 'certificate':
				return '🏆';
			case 'id':
			case 'identification document':
				return '🆔';
			case 'photo':
			case 'profile photo':
				return '📸';
			case 'transcript':
			case 'academic transcript':
				return '📜';
			case 'reference':
			case 'reference letter':
				return '📝';
			case 'portfolio':
				return '💼';
			default:
				return '📎';
		}
	};

	const getVerificationStatus = (document) => {
		if (!document.verified) {
			return { text: 'Not Verified', color: 'text-gray-500', bg: 'bg-gray-100' };
		}
		return { text: 'Verified', color: 'text-green-600', bg: 'bg-green-100' };
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			{documents.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">📂</div>
					<h4 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h4>
					<p className="text-gray-600 mb-4">Upload your CV, certificates, and other documents to complete your profile</p>
					<button
						onClick={onUpload}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Upload Your First Document
					</button>
				</div>
			) : (
				<div className="space-y-4">
					{documents.map(document => {
						const verificationStatus = getVerificationStatus(document);
						return (
							<div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between">
									<div className="flex items-center flex-1">
										<div className="text-2xl mr-4">
											{getDocumentIcon(document.documentType)}
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-1">
												<h4 className="font-medium text-gray-900">{document.documentType}</h4>
												<span className={`px-2 py-1 text-xs rounded-full ${verificationStatus.bg} ${verificationStatus.color}`}>
													{verificationStatus.text}
												</span>
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-500">
												<span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
												<span>•</span>
												<span>{formatFileSize(document.fileSize || 0)}</span>
												{document.verified && document.verifiedAt && (
													<>
														<span>•</span>
														<span>Verified: {new Date(document.verifiedAt).toLocaleDateString()}</span>
													</>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2 ml-4">
										<button
											onClick={() => {/* TODO: Implement download */}}
											className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded hover:bg-blue-50"
											title="Download"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</button>
										{!document.verified && (
											<button
												onClick={() => handleVerifyDocument(document.id)}
												disabled={verifyingId === document.id}
												className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50"
												title="Verify Document"
											>
												{verifyingId === document.id ? (
													<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
													</svg>
												) : (
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												)}
											</button>
										)}
										<button
											onClick={() => handleDeleteDocument(document.id)}
											disabled={deletingId === document.id}
											className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
											title="Delete"
										>
											{deletingId === document.id ? (
												<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
												</svg>
											) : (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											)}
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Document Type Legend */}
			<div className="mt-6 pt-4 border-t border-gray-200">
				<h4 className="text-sm font-medium text-gray-900 mb-3">Document Types</h4>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
					<div className="flex items-center gap-1">
						<span>📄</span>
						<span>CV/Resume</span>
					</div>
					<div className="flex items-center gap-1">
						<span>🏆</span>
						<span>Certificates</span>
					</div>
					<div className="flex items-center gap-1">
						<span>🆔</span>
						<span>ID Documents</span>
					</div>
					<div className="flex items-center gap-1">
						<span>📸</span>
						<span>Photos</span>
					</div>
					<div className="flex items-center gap-1">
						<span>📜</span>
						<span>Transcripts</span>
					</div>
					<div className="flex items-center gap-1">
						<span>📝</span>
						<span>References</span>
					</div>
					<div className="flex items-center gap-1">
						<span>💼</span>
						<span>Portfolio</span>
					</div>
					<div className="flex items-center gap-1">
						<span>📎</span>
						<span>Other</span>
					</div>
				</div>
			</div>
		</div>
	);
}
