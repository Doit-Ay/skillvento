import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import Button from '../common/Button';
import Input from '../common/Input';

interface JoinTeamFormProps {
  onSuccess?: () => void;
  defaultCode?: string;
}

const JoinTeamForm: React.FC<JoinTeamFormProps> = ({ onSuccess, defaultCode = '' }) => {
  const [inviteCode, setInviteCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: joinError } = await db.joinTeam(inviteCode.trim(), user.id);
      
      if (joinError) throw joinError;
      
      setSuccess(`Successfully joined team "${data?.team?.name || 'Team'}"`);
      setInviteCode('');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error joining team:', err);
      setError(err.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Join a Team</h3>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Team Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter the team invite code"
            fullWidth
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ask your team admin for the invite code
          </p>
        </div>
        
        <Button
          type="submit"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          fullWidth
        >
          Join Team
        </Button>
      </form>
    </div>
  );
};

export default JoinTeamForm;