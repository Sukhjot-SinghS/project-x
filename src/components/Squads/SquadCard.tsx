'use client'
import { useState } from 'react';
import { Crown, Users, Link as LinkIcon, LogOut, Lock, Unlock } from 'lucide-react';
import type { Squad } from '@/types';
import { getUserById } from '@/lib/mockData/users';
import { Card } from '@/components/Shared/Card';
import { Badge } from '@/components/Shared/Badge';
import { Avatar } from '@/components/Shared/Avatar';
import { Button } from '@/components/Shared/Button';
import { Modal } from '@/components/Shared/Modal';
import { useToast } from '@/components/Shared/Toast';
import { generateRandomString } from '@/lib/utils';

interface SquadCardProps {
  squad: Squad;
  currentUserId: string;
  onLeave: (squad: Squad) => void;
}

export function SquadCard({ squad, currentUserId, onLeave }: SquadCardProps) {
  const captain = getUserById(squad.captainId);
  const isCaptain = squad.captainId === currentUserId;
  const toast = useToast();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const handleCopyLink = () => {
    const mockLink = `crewup.xyz/invite/${generateRandomString(6)}`;
    navigator.clipboard?.writeText(mockLink);
    toast.success('Link copied! Share it with friends.');
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-semibold text-charcoal">{squad.name}</h3>
              {isCaptain && (
                <Badge variant="mustard">
                  <Crown className="w-3 h-3" /> Captain
                </Badge>
              )}
            </div>
            {captain && (
              <p className="text-xs text-charcoal/55 mt-0.5">
                Captain: {captain.name}
              </p>
            )}
          </div>
          <div className="text-charcoal/40">
            {squad.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </div>
        </div>

        {squad.description && (
          <p className="text-sm text-charcoal/65 mb-3">{squad.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {squad.members.slice(0, 5).map((mid) => {
              const m = getUserById(mid);
              return m ? (
                <Avatar key={mid} src={m.avatar} alt={m.name} size="sm" className="ring-2 ring-white" />
              ) : null;
            })}
          </div>
          <span className="flex items-center gap-1 text-xs text-charcoal/55">
            <Users className="w-3.5 h-3.5" /> {squad.members.length} member
            {squad.members.length !== 1 ? 's' : ''}
          </span>
          {squad.pendingRequests.length > 0 && (
            <Badge variant="terracotta">{squad.pendingRequests.length} pending</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
            <LinkIcon className="w-3.5 h-3.5" /> Invite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeaveOpen(true)}
            className="text-terracotta"
          >
            <LogOut className="w-3.5 h-3.5" /> Leave
          </Button>
        </div>
      </Card>

      <Modal isOpen={leaveOpen} onClose={() => setLeaveOpen(false)} title="Leave squad?">
        <p className="text-sm text-charcoal/70 mb-5">
          {isCaptain
            ? 'You are the Captain of this squad. You will need to nominate a successor before leaving.'
            : `Are you sure you want to leave ${squad.name}? You can rejoin later with an invite.`}
        </p>
        <div className="flex gap-2">
          <Button variant="danger" className="flex-1" onClick={() => { onLeave(squad); setLeaveOpen(false); }}>
            Leave Squad
          </Button>
          <Button variant="outline" onClick={() => setLeaveOpen(false)}>
            Stay
          </Button>
        </div>
      </Modal>
    </>
  );
}

