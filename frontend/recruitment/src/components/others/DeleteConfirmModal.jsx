import React from 'react';

export default function DeleteConfirmModal({
	showDeleteModal,
	setShowDeleteModal,
	jobToDelete,
	handleDeleteConfirm,
	deletingJob
}) {
	if (!showDeleteModal || !jobToDelete) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-red-600">Delete Job</h3>
					<button
						onClick={() => setShowDeleteModal(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-700">
						Are you sure you want to delete the job "{jobToDelete.title}"?
					</p>
					<p className="text-sm text-gray-500 mt-2">
						This action cannot be undone. All associated applications and interviews will be affected.
					</p>
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={() => setShowDeleteModal(false)}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleDeleteConfirm}
						disabled={deletingJob}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
					>
						{deletingJob ? 'Deleting...' : 'Delete Job'}
					</button>
				</div>
			</div>
		</div>
	);
}
