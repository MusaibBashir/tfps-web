import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Package, ClipboardList, User, Camera, UserPlus, Plus } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import AddUserForm from '../components/AddUserForm';
import AddEquipmentForm from '../components/AddEquipmentForm';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('users');
  
  // Get tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['users', 'equipment', 'requests'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Redirect non-admin users
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin?tab=${tab}`);
  };

  if (!user?.is_admin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, equipment, and club settings</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('users')}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </button>
            <button
              onClick={() => handleTabChange('equipment')}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'equipment'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="mr-2 h-5 w-5" />
              Equipment
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              Requests
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-primary-500" />
              Add New User
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new account for a club member
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <AddUserForm />
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Camera className="mr-2 h-5 w-5 text-primary-500" />
              Add New Equipment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Register new equipment in the system
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <AddEquipmentForm />
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            View and manage all equipment requests on the <a href="/requests" className="text-primary-600 hover:text-primary-800">Requests page</a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;