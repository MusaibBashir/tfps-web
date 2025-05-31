import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Camera, Lightbulb, Mic, Plus } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { Equipment } from '../types';

const EquipmentPage = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .is('parent_id', null) // Only top-level equipment (not lenses)
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setEquipment(data);
          setFilteredEquipment(data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [supabase]);

  useEffect(() => {
    // Filter equipment based on search query and filters
    let filtered = equipment;
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    
    if (selectedOwnership !== 'all') {
      filtered = filtered.filter(item => item.ownership_type === selectedOwnership);
    }
    
    setFilteredEquipment(filtered);
  }, [searchQuery, selectedType, selectedStatus, selectedOwnership, equipment]);

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <Camera className="h-6 w-6" />;
      case 'light':
        return <Lightbulb className="h-6 w-6" />;
      case 'audio':
        return <Mic className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-2">Browse and manage all available equipment</p>
        </div>
        {user?.is_admin && (
          <div className="mt-4 sm:mt-0">
            <Link to="/admin?tab=equipment" className="btn btn-primary flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add Equipment
            </Link>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div>
          <select 
            className="select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="camera">Cameras</option>
            <option value="lens">Lenses</option>
            <option value="tripod">Tripods</option>
            <option value="light">Lights</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <select 
            className="select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
          
          <select 
            className="select"
            value={selectedOwnership}
            onChange={(e) => setSelectedOwnership(e.target.value)}
          >
            <option value="all">All Ownership</option>
            <option value="hall">Hall Owned</option>
            <option value="student">Student Owned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item) => (
            <Link 
              key={item.id} 
              to={`/equipment/${item.id}`}
              className="card group animate-fade-in"
            >
              <div className={`p-4 flex justify-center ${
                item.status === 'available' ? 'bg-green-50' : 
                item.status === 'in_use' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className={`p-4 rounded-full ${
                  item.status === 'available' ? 'text-green-500' : 
                  item.status === 'in_use' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {getEquipmentIcon(item.type)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col items-start">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'in_use'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.ownership_type === 'hall' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.ownership_type.charAt(0).toUpperCase() + item.ownership_type.slice(1)} Owned
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search query.
          </p>
          {user?.is_admin && (
            <div className="mt-6">
              <Link 
                to="/admin?tab=equipment" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add New Equipment
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;