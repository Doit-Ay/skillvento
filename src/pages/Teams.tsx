import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, Search, Filter, ChevronDown } from 'lucide-react';
import { auth, db } from '../lib/supabase';
import { Team } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TeamCard from '../components/teams/TeamCard';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import JoinTeamForm from '../components/teams/JoinTeamForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/placeholders/LoadingSpinner';

const Teams: React.FC = () => {
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get('code') || '';
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'member'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    loadTeams();
  }, []);
  
  const loadTeams = async () => {
    try {
      setLoading(true);
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: teamsError } = await db.getUserTeams(user.id);
      
      if (teamsError) throw teamsError;
      
      // Process teams data
      const processedTeams = data?.map((item: any) => {
        // Add role information and placeholder counts
        return {
          ...item.teams,
          role: item.role,
          members_count: Math.floor(Math.random() * 10) + 1,
          certificates_count: Math.floor(Math.random() * 20) + 1
        };
      }) || [];
      
      setTeams(processedTeams);
    } catch (err: any) {
      console.error('Error loading teams:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTeamSuccess = () => {
    setShowCreateModal(false);
    loadTeams();
  };
  
  const handleJoinTeamSuccess = () => {
    loadTeams();
    // Clear the join code from URL
    navigate('/teams');
  };
  
  const handleViewTeam = (teamId: string) => {
    navigate(`/teams/${teamId}`);
  };
  
  const filteredTeams = teams.filter(team => {
    // Apply search filter
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (team.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply type filter
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'owned') return matchesSearch && team.role === 'owner';
    if (filterType === 'member') return matchesSearch && team.role !== 'owner';
    
    return matchesSearch;
  });
  
  if (loading) {
    return <LoadingSpinner message="Loading teams..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
              <p className="text-gray-600">
                Collaborate with others and showcase team achievements
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
              >
                Create Team
              </Button>
              <Button
                variant="outline"
                icon={UserPlus}
                onClick={() => navigate('/teams?join=true')}
              >
                Join Team
              </Button>
            </div>
          </div>
        </div>
        
        {/* Join Team Form (if code is provided) */}
        {joinCode && (
          <div className="mb-8">
            <JoinTeamForm defaultCode={joinCode} onSuccess={handleJoinTeamSuccess} />
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span>
                  {filterType === 'all' && 'All Teams'}
                  {filterType === 'owned' && 'Teams I Own'}
                  {filterType === 'member' && 'Teams I\'m In'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showFilterDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilterDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setShowFilterDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All Teams
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('owned');
                        setShowFilterDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Teams I Own
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('member');
                        setShowFilterDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Teams I'm In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Teams Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h2>
            <p className="text-gray-600 mb-6">
              {teams.length === 0 
                ? "You haven't created or joined any teams yet." 
                : "No teams match your search criteria."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
              >
                Create a Team
              </Button>
              <Button
                variant="outline"
                icon={UserPlus}
                onClick={() => navigate('/teams?join=true')}
              >
                Join a Team
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard 
                key={team.id} 
                team={team} 
                onView={handleViewTeam}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateTeamSuccess}
        />
      )}
    </div>
  );
};

export default Teams;