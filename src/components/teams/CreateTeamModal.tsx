import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import Button from '../common/Button';
import Input from '../common/Input';

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: createError } = await db.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_public: formData.is_public
      }, user.id);
      
      if (createError) throw createError;
      
      onSuccess();
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Team Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter team name"
              required
              fullWidth
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your team's purpose"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_public"
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                Make this team public
              </label>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Team Benefits</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Collaborate with team members on certificates</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Create a shared portfolio for your team</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Track team progress and achievements</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={Plus}
            >
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;