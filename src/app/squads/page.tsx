'use client'

import { useEffect, useState } from 'react';
import { Plus, Check, X, Users } from 'lucide-react';
import { Tabs, TabPanel } from '@/components/Shared/Tabs';
import { SquadCard } from '@/components/Squads/SquadCard';
import { Card } from '@/components/Shared/Card';
import { Avatar } from '@/components/Shared/Avatar';
import { Badge } from '@/components/Shared/Badge';
import { Button } from '@/components/Shared/Button';
import { Modal } from '@/components/Shared/Modal';
import { Input, Textarea, Label } from '@/components/Shared/Input';
import { EmptyState } from '@/components/Shared/EmptyState';
import { useToast } from '@/components/Shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { createSquadAction, approveJoinRequestAction, rejectJoinRequestAction, leaveSquadAction } from '@/app/actions/squad';

export default function SquadDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('my');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  const fetchSquads = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    
    // Fetch squads user belongs to
    const { data: userSquadMemberships } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('user_id', user.id)
      .eq('status', 'active');
      
    const squadIds = userSquadMemberships?.map(sm => sm.squad_id) || [];
    
    if (squadIds.length > 0) {
      const { data } = await supabase
        .from('squads')
        .select(`
          id, name, description, captain_id, is_locked, status,
          squad_members (
            user_id,
            status,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .in('id', squadIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (data) {
        const formattedSquads = data.map(s => ({
          ...s,
          members: s.squad_members.filter((sm: any) => sm.status === 'active').map((sm: any) => sm.user_id),
          captainId: s.captain_id
        }));
        setSquads(formattedSquads);
      }
    } else {
      setSquads([]);
    }

    // Fetch pending join requests for squads where user is captain
    const { data: myCaptainedSquads } = await supabase
      .from('squads')
      .select('id, name')
      .eq('captain_id', user.id);
      
    if (myCaptainedSquads && myCaptainedSquads.length > 0) {
      const { data: pending } = await supabase
        .from('squad_members')
        .select(`
          id, squad_id, user_id, status,
          profiles (
            full_name, avatar_url, c_score, is_verified
          ),
          squads (name)
        `)
        .in('squad_id', myCaptainedSquads.map(s => s.id))
        .eq('status', 'pending');
        
      if (pending) setPendingInvites(pending);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchSquads();
  }, [user]);

  const handleLeave = async (squad: any) => {
    const result = await leaveSquadAction(squad.id);
    if (result.success) {
      toast.info(`Left squad`);
      fetchSquads();
    } else {
      toast.error(result.message || 'Failed to leave');
    }
  };

  const handleApprove = async (memberId: string) => {
    const result = await approveJoinRequestAction(memberId);
    if (result.success) {
      toast.success('Approved.');
      fetchSquads();
    } else {
      toast.error(result.message || 'Failed to approve');
    }
  };

  const handleReject = async (memberId: string) => {
    const result = await rejectJoinRequestAction(memberId);
    if (result.success) {
      toast.info('Request rejected.');
      fetchSquads();
    } else {
      toast.error(result.message || 'Failed to reject');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Give your squad a name.');
      return;
    }
    const result = await createSquadAction({ name: newName, description: newDesc });
    if (result.success) {
      setNewName('');
      setNewDesc('');
      setIsCreateOpen(false);
      toast.success(`${newName} created!`);
      fetchSquads();
    } else {
      toast.error(result.message || 'Failed to create squad');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Squads</h1>
          <p className="text-sm text-charcoal/55">Your travel crews and invites.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'my', label: 'My Squads', count: squads.length },
          { id: 'pending', label: 'Pending Invites', count: pendingInvites.length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <TabPanel isActive={activeTab === 'my'}>
        {squads.length === 0 && !loading ? (
          <EmptyState
            title="No squads yet"
            message="Create your first squad and invite friends to start travelling together."
            icon={<Users className="w-9 h-9" />}
            action={
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" /> Create Squad
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {squads.map((squad) => (
              <SquadCard
                key={squad.id}
                squad={squad}
                currentUserId={user?.id || ''}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </TabPanel>

      <TabPanel isActive={activeTab === 'pending'}>
        {pendingInvites.length === 0 ? (
          <EmptyState
            title="No pending requests"
            message="When someone asks to join your squad, you will see them here."
            icon={<Users className="w-9 h-9" />}
          />
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const u = invite.profiles;
              if (!u) return null;
              return (
                <Card key={invite.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={u.avatar_url} alt={u.full_name} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{u.full_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="muted">
                          C-Score {u.c_score}
                        </Badge>
                        {u.is_verified && <Badge variant="teal">Verified</Badge>}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal/55 mb-3">
                    Wants to join <span className="font-medium text-charcoal">{invite.squads.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(invite.id)}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(invite.id)}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabPanel>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create a Squad">
        <div className="space-y-4">
          <div>
            <Label>Squad name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Weekend Wanderers"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What kind of trips does your squad go on?"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={handleCreate}>
              Create Squad
            </Button>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
