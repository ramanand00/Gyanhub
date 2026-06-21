// components/Profile.jsx
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            My Profile
          </h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-semibold">{user?.name}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="text-lg font-semibold">{user?.mobileNumber}</p>
            </div>

            <div className="pb-4">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="text-lg font-semibold text-green-600">✓ Verified</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;