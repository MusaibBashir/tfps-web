import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Equipment, User, Event } from '../types';
import { format } from 'date-fns';

interface RequestEquipmentModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const RequestEquipmentModal: React.FC<RequestEquipmentModalProps> = ({
  equipment,
  isOpen,
  onClose,
  currentUser
}) => {
  const { supabase } = useSupabase();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const today = new Date().toISOString();
        
        // Fetch upcoming events created by the current user
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', currentUser.id)
          .eq('is_approved', true) // Only approved events
          .gte('start_time', today)
          .order('start_time');
          
        if (error) throw error;
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again.');
      }
    };

    fetchUserEvents();
  }, [supabase, currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      // Create equipment request
      const { error } = await supabase
        .from('equipment_requests')
        .insert({
          equipment_id: equipment.id,
          event_id: selectedEvent || null,
          requester_id: currentUser.id,
          status: 'pending',
          notes: notes || null,
        });
        
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error requesting equipment:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Request Equipment
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Request Submitted!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your request for {equipment.name} has been submitted successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  You are requesting: <span className="font-medium text-gray-900">{equipment.name}</span>
                </p>
              </div>
              
              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700">
                  Select Event (Optional)
                </label>
                {events.length > 0 ? (
                  <select
                    id="event"
                    className="select mt-1"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">No specific event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({format(new Date(event.start_time), 'MMM d, yyyy')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                    You don't have any upcoming approved events. You can still request equipment for general use.
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="input mt-1"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or details about your request"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestEquipmentModal;