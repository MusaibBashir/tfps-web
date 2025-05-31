import { useState, FormEvent } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

const AddUserForm = () => {
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    hostel: '',
    year: '1',
    domain: 'Photography',
    is_admin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single();
        
      if (existingUser) {
        setError('Username already exists. Please choose a different username.');
        return;
      }
      
      // Create new user
      const { error } = await supabase
        .from('users')
        .insert({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          hostel: formData.hostel,
          year: parseInt(formData.year),
          domain: formData.domain,
          is_admin: formData.is_admin,
        });
        
      if (error) throw error;
      
      setSuccess(true);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        hostel: '',
        year: '1',
        domain: 'Photography',
        is_admin: false,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user. Please try again.');
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
                User created successfully!
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
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            required
            className="input mt-1"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className="input mt-1"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="input mt-1"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">
            Hostel
          </label>
          <input
            type="text"
            name="hostel"
            id="hostel"
            required
            className="input mt-1"
            value={formData.hostel}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            name="year"
            id="year"
            required
            className="select mt-1"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
            Domain
          </label>
          <select
            name="domain"
            id="domain"
            required
            className="select mt-1"
            value={formData.domain}
            onChange={handleChange}
          >
            <option value="Photography">Photography</option>
            <option value="Cinematography">Cinematography</option>
            <option value="Editing">Editing</option>
            <option value="Sound">Sound</option>
            <option value="Direction">Direction</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center h-full mt-8">
          <input
            type="checkbox"
            name="is_admin"
            id="is_admin"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.is_admin}
            onChange={handleChange}
          />
          <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-700">
            Admin User
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full sm:w-auto"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;