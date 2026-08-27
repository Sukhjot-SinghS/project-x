'use client'
import { useState } from 'react';
import { Modal } from '@/components/Shared/Modal';
import { Button } from '@/components/Shared/Button';
import { Input, Textarea, Label } from '@/components/Shared/Input';
import { useToast } from '@/components/Shared/Toast';
import { mockAsyncUpdate } from '@/lib/mockApi';
import type { User } from '@/types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updated: Partial<User>) => void;
}

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [interests, setInterests] = useState(user.interests || '');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await mockAsyncUpdate({ name, bio, interests });
      onSave({ name, bio, interests });
      toast.success('Changes saved (demo)');
      onClose();
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." />
        </div>
        <div>
          <Label>Interests</Label>
          <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Photography, Trekking, ..." />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="primary" className="flex-1" loading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

