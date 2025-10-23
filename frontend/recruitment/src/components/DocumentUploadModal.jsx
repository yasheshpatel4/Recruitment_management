import React, { useState } from 'react';

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

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess }) {
	const [documentType, setDocumentType] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadError, setUploadError] = useState('');
	const [uploadSuccess, setUploadSuccess] = useState('');
	const [isDragOver, setIsDragOver] = useState(false);

	const documentTypes = [
		{ value: 'CV', label: 'Curriculum Vitae', extensions: ['.pdf', '.doc', '.docx'], maxSize: 10 },
		{ value: 'Certificate', label: 'Certificate', extensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'], maxSize: 5 },
		{ value: 'ID', label: 'Identification Document', extensions: ['.pdf', '.jpg', '.jpeg', '.png'], maxSize: 5 },
		{ value: 'Photo', label: 'Profile Photo', extensions: ['.jpg', '.jpeg', '.png'], maxSize: 5 },
		{ value: 'Transcript', label: 'Academic Transcript', extensions: ['.pdf', '.doc', '.docx'], maxSize: 5 },
		{ value: 'Reference', label: 'Reference Letter', extensions: ['.pdf', '.doc', '.docx'], maxSize: 5 },
		{ value: 'Portfolio', label: 'Portfolio/Work Samples', extensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'], maxSize: 5 },
		{ value: 'Other', label: 'Other Document', extensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'], maxSize: 5 }
	];

	const getCurrentDocType = () => documentTypes.find(type => type.value === documentType);

	const validateFile = (file) => {
		if (!file) return 'Please select a file';

		const docType = getCurrentDocType();
		if (!docType) return 'Please select a document type first';

		const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
		if (!docType.extensions.includes(fileExtension)) {
			return `Invalid file type. Allowed types: ${docType.extensions.join(', ')}`;
		}

		const maxSizeMB = docType.maxSize;
		if (file.size > maxSizeMB * 1024 * 1024) {
			return `File size must be less than ${maxSizeMB}MB`;
		}

		return null;
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			const error = validateFile(file);
			if (error) {
				setUploadError(error);
				setSelectedFile(null);
			} else {
				setUploadError('');
				setSelectedFile(file);
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragOver(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			const file = files[0];
			const error = validateFile(file);
			if (error) {
				setUploadError(error);
				setSelectedFile(null);
			} else {
				setUploadError('');
				setSelectedFile(file);
				const fileInput = document.getElementById('document-file-upload');
				fileInput.files = files; // Set the file to the input
			}
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !documentType) {
			setUploadError('Please select both document type and file');
			return;
		}

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('documentType', documentType);

		try {
			setUploading(true);
			setUploadError('');
			setUploadSuccess('');
			setUploadProgress(0);

			const token = localStorage.getItem('rp_token');
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener('progress', (e) => {
				if (e.lengthComputable) {
					const percentComplete = (e.loaded / e.total) * 100;
					setUploadProgress(Math.round(percentComplete));
				}
			});

			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					setUploadSuccess('Document uploaded successfully!');
					setSelectedFile(null);
					setDocumentType('');
					setUploadProgress(0);
					if (onUploadSuccess) onUploadSuccess();
					setTimeout(() => {
						onClose();
						setUploadSuccess('');
					}, 2000);
				} else {
					try {
						const errorData = JSON.parse(xhr.responseText);
						setUploadError(errorData.message || 'Failed to upload document');
					} catch {
						setUploadError('Failed to upload document');
					}
				}
				setUploading(false);
			});

			xhr.addEventListener('error', () => {
				setUploadError('Network error occurred during upload');
				setUploading(false);
			});

			xhr.addEventListener('abort', () => {
				setUploadError('Upload was cancelled');
				setUploading(false);
			});

			xhr.open('POST', `${API_BASE_URL}/candidate/upload-document`);
			if (token) {
				xhr.setRequestHeader('Authorization', `Bearer ${token}`);
			}
			xhr.send(formData);
		} catch (error) {
			setUploadError(error.message || 'Failed to upload document');
			setUploading(false);
		}
	};

	const resetModal = () => {
		setDocumentType('');
		setSelectedFile(null);
		setUploading(false);
		setUploadProgress(0);
		setUploadError('');
		setUploadSuccess('');
		setIsDragOver(false);
	};

	const handleClose = () => {
		resetModal();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Upload Document</h3>
					<button
						onClick={handleClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					{/* Document Type Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Document Type *
						</label>
						<select
							value={documentType}
							onChange={(e) => {
								setDocumentType(e.target.value);
								setSelectedFile(null); // Reset file when type changes
								setUploadError('');
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select document type</option>
							{documentTypes.map(type => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
						{documentType && (
							<p className="text-xs text-gray-500 mt-1">
								Allowed: {getCurrentDocType().extensions.join(', ')} • Max size: {getCurrentDocType().maxSize}MB
							</p>
						)}
					</div>

					{/* File Upload Area */}
					{documentType ? (
						selectedFile ? (
							<div className="border-2 border-solid border-green-300 rounded-lg p-4 bg-green-50">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<div className="ml-3">
											<p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
											<p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
										</div>
									</div>
									<div className="flex gap-2">
										<label htmlFor="document-file-upload" className="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
											Change
											<input
												id="document-file-upload"
												name="document-file-upload"
												type="file"
												className="sr-only"
												accept={getCurrentDocType().extensions.join(',')}
												onChange={handleFileSelect}
											/>
										</label>
										<button
											onClick={() => {
												setSelectedFile(null);
												setUploadError('');
												const fileInput = document.getElementById('document-file-upload');
												fileInput.value = '';
											}}
											className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
										>
											Remove
										</button>
									</div>
								</div>
							</div>
						) : (
							<div
								className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
									isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
								}`}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							>
								<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
									<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<div className="mt-4">
									<label htmlFor="document-file-upload" className="cursor-pointer">
										<span className="mt-2 block text-sm font-medium text-gray-900">
											{isDragOver ? 'Release to upload' : 'Drop your document here, or'} <span className="text-blue-600">browse</span>
										</span>
										<input
											id="document-file-upload"
											name="document-file-upload"
											type="file"
											className="sr-only"
											accept={getCurrentDocType().extensions.join(',')}
											onChange={handleFileSelect}
										/>
									</label>
									<p className="mt-1 text-xs text-gray-500">
										{getCurrentDocType().extensions.join(', ').toUpperCase()} up to {getCurrentDocType().maxSize}MB
									</p>
								</div>
							</div>
						)
					) : (
						<div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
							<p className="text-sm text-gray-500">Please select a document type first</p>
						</div>
					)}

					{/* Upload Progress */}
					{uploading && (
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${uploadProgress}%` }}
							></div>
						</div>
					)}

					{/* Error/Success Messages */}
					{uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
					{uploadSuccess && <p className="text-green-500 text-sm">{uploadSuccess}</p>}

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={handleClose}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							disabled={uploading}
						>
							Cancel
						</button>
						<button
							onClick={handleUpload}
							disabled={uploading || !selectedFile || !documentType}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{uploading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
