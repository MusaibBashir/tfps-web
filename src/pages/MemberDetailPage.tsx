import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Home, Calendar, Camera } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { User as UserType, Equipment } from '../types';

const MemberDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const [member, setMember] = useState<UserType | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch member details
        const { data: memberData, error: memberError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
          
        if (memberError) throw memberError;
        
        // Fetch equipment owned by this member
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .eq('owner_id', id)
          .eq('ownership_type', 'student');
          
        if (equipmentError) throw equipmentError;
        
        setMember(memberData);
        setEquipment(equipmentData || []);
      } catch (error) {
        console.error('Error fetching member details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id, supabase]);

  const getInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Member not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The member you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link 
            to="/members" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-6">
        <Link 
          to="/members" 
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Members
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8 bg-primary-50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="avatar h-24 w-24 text-2xl flex-shrink-0">
              {getInitial(member.name)}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {member.name}
                {member.is_admin && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Admin
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">{member.domain}</p>
              <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="mr-1 h-4 w-4" />
                  {member.year}rd Year
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Home className="mr-1 h-4 w-4" />
                  {member.hostel}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-1 h-4 w-4" />
                  Joined: {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="mr-2 h-5 w-5 text-primary-600" />
            Equipment Owned
          </h2>
          
          {equipment.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {equipment.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'in_use'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link 
                          to={`/equipment/${item.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment</h3>
              <p className="mt-1 text-sm text-gray-500">
                This member doesn't own any equipment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;