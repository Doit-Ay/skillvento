import React from 'react';
import { Users, AlignCenterVertical as Certificate, UserPlus, ExternalLink } from 'lucide-react';
import { Team } from '../../types';
import Button from '../common/Button';

interface TeamCardProps {
  team: Team;
  onView: (teamId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onView }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Team Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {team.is_public ? 'Public Team' : 'Private Team'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Team Stats */}
      <div className="p-6 flex-1">
        {team.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-700">Members</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{team.members_count || 0}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Certificate className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-700">Certificates</span>
            </div>
            <p className="text-xl font-bold text-purple-900">{team.certificates_count || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Team Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={() => onView(team.id)}
            fullWidth
          >
            View Team
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            icon={UserPlus}
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/teams?code=${team.invite_code}`)}
            fullWidth
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            Copy Invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;