import { useState, FormEvent, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { User } from '../types';

const AddEquipmentForm = () => {
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    type: 'camera',
    subtype: '',
    parent_id: '',
    ownership_type: 'hall',
    owner_id: '',
    status: 'available',
    image_url: '',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [cameras, setCameras] = useState<{ id: string; name: string }[]>([]);
  const [showParentSelect, setShowParentSelect] = useState(false);
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .order('name');
        
      setUsers(data || []);
    };

    const fetchCameras = async () => {
      const { data } = await supabase
        .from('equipment')
        .select('id, name')
        .eq('type', 'camera')
        .order('name');
        
      setCameras(data || []);
    };

    fetchUsers();
    fetchCameras();
  }, [supabase]);

  useEffect(() => {
    // Show parent select for lenses
    setShowParentSelect(formData.type === 'lens');
    
    // Show owner select for student-owned equipment
    setShowOwnerSelect(formData.ownership_type === 'student');
    
    // Reset related fields when type or ownership changes
    if (!showParentSelect) {
      setFormData(prev => ({ ...prev, parent_id: '' }));
    }
    
    if (!showOwnerSelect) {
      setFormData(prev => ({ ...prev, owner_id: '' }));
    }
  }, [formData.type, formData.ownership_type, showParentSelect, showOwnerSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Create new equipment
      const { error } = await supabase
        .from('equipment')
        .insert({
          name: formData.name,
          type: formData.type,
          subtype: formData.subtype || null,
          parent_id: formData.parent_id || null,
          ownership_type: formData.ownership_type,
          owner_id: formData.owner_id || null,
          status: formData.status,
          image_url: formData.image_url || null,
          details: formData.details || null,
        });
        
      if (error) throw error;
      
      setSuccess(true);
      setFormData({
        name: '',
        type: 'camera',
        subtype: '',
        parent_id: '',
        ownership_type: 'hall',
        owner_id: '',
        status: 'available',
        image_url: '',
        details: '',
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
      setError('Failed to create equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400\" xmlns="http://www.w3.org/2000/svg\" viewBox="0 0 20 20\" fill="currentColor">
                <path fillRule="evenodd\" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Equipment created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Equipment Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="input mt-1"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            id="type"
            required
            className="select mt-1"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="camera">Camera</option>
            <option value="lens">Lens</option>
            <option value="tripod">Tripod</option>
            <option value="light">Light</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </select>
        </div>

        {showParentSelect && (
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
              Parent Camera
            </label>
            <select
              name="parent_id"
              id="parent_id"
              required={showParentSelect}
              className="select mt-1"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <option value="">Select a camera</option>
              {cameras.map(camera => (
                <option key={camera.id} value={camera.id}>{camera.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="subtype" className="block text-sm font-medium text-gray-700">
            Subtype (Optional)
          </label>
          <input
            type="text"
            name="subtype"
            id="subtype"
            className="input mt-1"
            placeholder="e.g., DSLR, Mirrorless, Prime Lens, etc."
            value={formData.subtype}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="ownership_type" className="block text-sm font-medium text-gray-700">
            Ownership Type
          </label>
          <select
            name="ownership_type"
            id="ownership_type"
            required
            className="select mt-1"
            value={formData.ownership_type}
            onChange={handleChange}
          >
            <option value="hall">Hall Owned</option>
            <option value="student">Student Owned</option>
          </select>
        </div>

        {showOwnerSelect && (
          <div>
            <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
              Owner
            </label>
            <select
              name="owner_id"
              id="owner_id"
              required={showOwnerSelect}
              className="select mt-1"
              value={formData.owner_id}
              onChange={handleChange}
            >
              <option value="">Select an owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            required
            className="select mt-1"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            className="input mt-1"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">
            Details (Optional)
          </label>
          <textarea
            name="details"
            id="details"
            rows={3}
            className="input mt-1"
            value={formData.details}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full sm:w-auto"
        >
          {loading ? 'Creating...' : 'Add Equipment'}
        </button>
      </div>
    </form>
  );
};

export default AddEquipmentForm;