// pages/admin/CreatorRequests.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const CreatorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/admin/creator-requests');
      console.log('📋 Fetched requests:', res.data.users);
      setRequests(res.data.users);
    } catch (error) {
      console.error('Failed to fetch creator requests:', error);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    setMessage('');
    setError('');
    try {
      await API.put(`/api/admin/admin/approve-creator/${userId}`);
      setMessage('Creator request approved successfully!');
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve creator request');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessingId(selectedRequest._id);
    setMessage('');
    setError('');
    try {
      await API.put(`/api/admin/admin/reject-creator/${selectedRequest._id}`, {
        notes: rejectNote
      });
      setShowRejectModal(false);
      setRejectNote('');
      setSelectedRequest(null);
      setMessage('Creator request rejected successfully!');
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject creator request');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Creator Requests</h1>
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
            {requests.length} pending
          </span>
        </div>

        {message && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">All creator requests have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {request.profilePicture ? (
                        <img src={request.profilePicture} alt={request.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xl">{request.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                      <p className="text-gray-400 text-sm">{request.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(request.creatorRequest?.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={processingId === request._id}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {processingId === request._id ? 'Processing...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectModal(true);
                      }}
                      disabled={processingId === request._id}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => setSelectedRequest(selectedRequest?._id === request._id ? null : request)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      📋 Details
                    </button>
                  </div>
                </div>

                {/* Show expanded details */}
                {selectedRequest?._id === request._id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Expertise</p>
                        <p className="text-white font-medium">
                          {request.creatorRequest?.expertise || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Experience</p>
                        <p className="text-white font-medium">
                          {request.creatorRequest?.experience || 'Not provided'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-400">Reason for becoming a creator</p>
                        <p className="text-white">
                          {request.creatorRequest?.reason || 'Not provided'}
                        </p>
                      </div>
                      {request.creatorRequest?.portfolio && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-400">Portfolio / Sample Work</p>
                          <a 
                            href={request.creatorRequest.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {request.creatorRequest.portfolio}
                          </a>
                        </div>
                      )}
                      {request.creatorRequest?.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-red-400">Previous Rejection Reason</p>
                          <p className="text-red-300">{request.creatorRequest.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Reject Creator Request</h2>
              <p className="text-gray-400 mb-4">
                Rejecting request from <span className="text-white font-medium">{selectedRequest.name}</span>
              </p>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-1">Reason for rejection (optional)</label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReject}
                  disabled={processingId === selectedRequest._id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processingId === selectedRequest._id ? 'Processing...' : 'Reject Request'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectNote('');
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreatorRequests;