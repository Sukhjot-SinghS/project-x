'use client'
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/Shared/Modal';
import { Button } from '@/components/Shared/Button';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  conflictingTrip: string;
  dates: string;
  onRemoveAndConfirm: () => void;
  onDecline: () => void;
}

export function ConflictModal({
  isOpen,
  onClose,
  memberName,
  conflictingTrip,
  dates,
  onRemoveAndConfirm,
  onDecline,
}: ConflictModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conflict Detected">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-terracotta-light/60 flex items-center justify-center mb-3 text-terracotta">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-sm text-charcoal leading-relaxed">
          Member <span className="font-semibold">{memberName}</span> is already booked on{' '}
          <span className="font-semibold">{conflictingTrip}</span> ({dates}).
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="primary" className="w-full" onClick={onRemoveAndConfirm}>
          Remove {memberName.split(' ')[0]} &amp; Confirm
        </Button>
        <Button variant="outline" className="w-full" onClick={onDecline}>
          Decline Offer
        </Button>
      </div>
    </Modal>
  );
}

