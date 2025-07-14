import { X } from 'lucide-react';
import { BookingForm } from './BookingForm';

interface BookingModalProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

export function BookingModal({ serviceId, isOpen, onClose, onSuccess }: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative animate-fade-in-up">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="max-h-[90vh] overflow-y-auto p-1">
          <BookingForm 
            serviceId={serviceId} 
            onClose={onClose} 
            onSuccess={onSuccess} 
          />
        </div>
      </div>
    </div>
  );
}
