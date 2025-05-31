import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Info, Package } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Event, Equipment } from '../types';
import { format, parseISO } from 'date-fns';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  isCreating: boolean;
  currentUserId: string;
  isAdmin: boolean;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  isCreating,
  currentUserId,
  isAdmin
}) => {
  const { supabase } = useSupabase();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<'shoot' | 'screening' | 'other'>('shoot');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setEventType(event.event_type);
      
      const startDateTime = parseISO(event.start_time);
      const endDateTime = parseISO(event.end_time);
      
      setStartDate(format(startDateTime, 'yyyy-MM-dd'));
      setStartTime(format(startDateTime, 'HH:mm'));
      setEndDate(format(endDateTime, 'yyyy-MM-dd'));
      setEndTime(format(endDateTime, 'HH:mm'));
    } else {
      // Default values for new event
      const now = new Date();
      setTitle('');
      setDescription('');
      setLocation('');
      setEventType('shoot');
      setStartDate(format(now, 'yyyy-MM-dd'));
      setStartTime(format(now, 'HH:mm'));
      setEndDate(format(now, 'yyyy-MM-dd'));
      setEndTime(format(now.setHours(now.getHours() + 2), 'HH:mm'));
    }
  }, [event]);

  useEffect(() => {
    // Fetch available equipment for selection
    const fetchAvailableEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('status', 'available')
          .order('name');
          
        if (error) throw error;
        setAvailableEquipment(data || []);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };

    if (isCreating) {
      fetchAvailableEquipment();
    }
  }, [supabase, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      const eventData = {
        title,
        description,
        location,
        event_type: eventType,
        start_time: startDateTime,
        end_time: endDateTime,
        created_by: currentUserId,
        is_approved: isAdmin, // Auto-approve if admin
        approved_by: isAdmin ? currentUserId : null,
      };
      
      if (isCreating) {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select('*')
          .single();
          
        if (error) throw error;
        
        // If equipment was selected, create equipment requests
        if (data && selectedEquipment.length > 0) {
          const equipmentRequests = selectedEquipment.map(equipmentId => ({
            equipment_id: equipmentId,
            event_id: data.id,
            requester_id: currentUserId,
            status: 'pending',
            notes: 'Requested during event creation',
          }));
          
          const { error: requestError } = await supabase
            .from('equipment_requests')
            .insert(equipmentRequests);
            
          if (requestError) {
            console.error('Error creating equipment requests:', requestError);
            // Don't fail the event creation if requests fail
          }
        }
        
        if (data) onSave(data);
      } else if (event) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select('*')
          .single();
          
        if (error) throw error;
        if (data) onSave(data);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          is_approved: true,
          approved_by: currentUserId
        })
        .eq('id', event.id)
        .select('*')
        .single();
        
      if (error) throw error;
      if (data) onSave(data);
    } catch (error) {
      console.error('Error approving event:', error);
      setError('Failed to approve event. Please try again.');
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
            {isCreating ? 'Create Event' : 'Event Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                className="input mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={!isCreating && !isAdmin}
              />
            </div>
            
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                id="eventType"
                className="select mt-1"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                disabled={!isCreating && !isAdmin}
              >
                <option value="shoot">Shoot</option>
                <option value="screening">Screening</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="input mt-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={!isCreating && !isAdmin}
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  className="input mt-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  disabled={!isCreating && !isAdmin}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="input mt-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={!isCreating && !isAdmin}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  className="input mt-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={!isCreating && !isAdmin}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="input mt-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!isCreating && !isAdmin}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="input mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isCreating && !isAdmin}
              />
            </div>
            
            {/* Equipment selection - only show when creating new event */}
            {isCreating && availableEquipment.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Equipment (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                  {availableEquipment.map((equipment) => (
                    <label key={equipment.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedEquipment.includes(equipment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipment([...selectedEquipment, equipment.id]);
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(id => id !== equipment.id));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        {equipment.name} ({equipment.type})
                      </span>
                    </label>
                  ))}
                </div>
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedEquipment.length} item(s) selected. Equipment requests will be created automatically.
                  </p>
                )}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            {!isCreating && !event?.is_approved && isAdmin && (
              <button
                type="button"
                onClick={handleApprove}
                className="btn btn-secondary"
                disabled={loading}
              >
                Approve Event
              </button>
            )}
            
            {(isCreating || isAdmin) && (
              <>
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
                  {loading ? 'Saving...' : isCreating ? 'Create Event' : 'Update Event'}
                </button>
              </>
            )}
            
            {!isCreating && !isAdmin && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Close
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;