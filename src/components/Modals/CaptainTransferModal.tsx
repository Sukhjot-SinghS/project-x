'use client'
import { Crown, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/Shared/Modal';
import { Button } from '@/components/Shared/Button';
import { Avatar } from '@/components/Shared/Avatar';
import { getUserById } from '@/lib/mockData/users';
import { useToast } from '@/components/Shared/Toast';
import { useState } from 'react';
import type { Squad } from '@/types';

interface CaptainTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  squad: Squad | null;
  onTransfer: (newCaptainId: string) => void;
}

export function CaptainTransferModal({ isOpen, onClose, squad, onTransfer }: CaptainTransferModalProps) {
  const [selected, setSelected] = useState('');
  const toast = useToast();

  if (!squad) return null;

  const otherMembers = squad.members.filter((m) => m !== squad.captainId);

  const handleTransfer = () => {
    if (!selected) {
      toast.error('Select a successor.');
      return;
    }
    const u = getUserById(selected);
    onTransfer(selected);
    toast.success(`${u?.name} is now the Captain.`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Captaincy">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-mustard-light/60 flex items-center justify-center mb-3 text-mustard">
          <Crown className="w-7 h-7" />
        </div>
        <p className="text-sm text-charcoal/70">
          You are the Captain of <span className="font-semibold">{squad.name}</span>. Nominate a successor to leave the squad.
        </p>
      </div>

      <div className="space-y-2 mb-5">
        {otherMembers.length === 0 ? (
          <p className="text-sm text-charcoal/50 text-center">No other members to transfer to.</p>
        ) : (
          otherMembers.map((mid) => {
            const m = getUserById(mid);
            if (!m) return null;
            return (
              <button
                key={mid}
                onClick={() => setSelected(mid)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selected === mid
                    ? 'border-terracotta bg-terracotta-light/30'
                    : 'border-charcoal/10 bg-white hover:border-terracotta/30'
                }`}
              >
                <Avatar src={m.avatar} alt={m.name} size="sm" />
                <span className="text-sm font-medium text-charcoal flex-1 text-left">{m.name}</span>
                {selected === mid && <Crown className="w-4 h-4 text-terracotta" />}
              </button>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" disabled={!selected} onClick={handleTransfer}>
          Transfer &amp; Leave <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

