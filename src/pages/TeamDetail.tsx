import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, AlignCenterVertical as Certificate, UserPlus, Settings, Copy, Check, ArrowLeft, Trash2, LogOut, Edit, Share2, Plus, X } from 'lucide-react';
import { auth, db } from '../lib/supabase';
import { Team, TeamMember, Certificate as CertificateType } from '../types';
import Button from '../components/common/Button';
import CertificateCard from '../components/dashboard/CertificateCard';
import LoadingSpinner from '../components/placeholders/LoadingSpinner';

const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [certificates, setCertificates] = useState<CertificateType[]>([]);
  const [userCertificates, setUserCertificates] = useState<CertificateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddCertificates, setShowAddCertificates] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [addingCertificates, setAddingCertificates] = useState(false);
  
  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);
  
  const loadTeamData = async () => {
    try {
      setLoading(true);
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get team details
      const { data: teamData, error: teamError } = await db.getTeamById(teamId!);
      
      if (teamError) throw teamError;
      
      setTeam(teamData);
      
      // Process members
      const teamMembers = teamData.team_members || [];
      setMembers(teamMembers);
      
      // Set user role
      const userMember = teamMembers.find(member => member.user_id === user.id);
      if (userMember) {
        setUserRole(userMember.role as 'owner' | 'admin' | 'member');
      } else {
        // User is not a member of this team
        throw new Error('You are not a member of this team');
      }
      
      // Get team certificates
      const { data: certData, error: certError } = await db.getTeamCertificates(teamId!);
      
      if (certError) throw certError;
      
      // Process certificates
      const teamCertificates = certData?.map(item => item.certificates) || [];
      setCertificates(teamCertificates);
      
      // Get user's certificates that are not already in the team
      const { data: userCerts } = await db.getUserCertificates(user.id);
      
      if (userCerts) {
        const teamCertIds = new Set(teamCertificates.map(cert => cert.id));
        const filteredUserCerts = userCerts.filter(cert => !teamCertIds.has(cert.id));
        setUserCertificates(filteredUserCerts);
      }
      
    } catch (err: any) {
      console.error('Error loading team data:', err);
      setError(err.message || 'Failed to load team data');
      
      // Redirect to teams page after a delay if there's an error
      setTimeout(() => {
        navigate('/teams');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const copyInviteLink = async () => {
    if (!team) return;
    
    try {
      const inviteLink = `${window.location.origin}/teams?code=${team.invite_code}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const handleLeaveTeam = async () => {
    if (!team || !userRole || userRole === 'owner') return;
    
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }
    
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      await db.leaveTeam(team.id, user.id);
      
      // Redirect to teams page
      navigate('/teams');
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };
  
  const handleDeleteTeam = async () => {
    if (!team || userRole !== 'owner') return;
    
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    
    try {
      await db.deleteTeam(team.id);
      
      // Redirect to teams page
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };
  
  const toggleCertificateSelection = (certId: string) => {
    setSelectedCertificates(prev => {
      if (prev.includes(certId)) {
        return prev.filter(id => id !== certId);
      } else {
        return [...prev, certId];
      }
    });
  };
  
  const handleAddCertificates = async () => {
    if (selectedCertificates.length === 0 || !team) return;
    
    try {
      setAddingCertificates(true);
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      // Add each selected certificate to the team
      for (const certId of selectedCertificates) {
        await db.addCertificateToTeam(team.id, certId, user.id);
      }
      
      // Reload team data
      await loadTeamData();
      
      // Reset state
      setShowAddCertificates(false);
      setSelectedCertificates([]);
    } catch (error) {
      console.error('Error adding certificates:', error);
    } finally {
      setAddingCertificates(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading team details..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h2>
          <p className="text-gray-600 mb-6">The team you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link to="/teams" className="text-white/80 hover:text-white flex items-center">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to Teams</span>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 mr-4">
                <span className="text-2xl font-bold">{team.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm text-white/80">{members.length} members</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm text-white/80">{certificates.length} certificates</span>
                  <span className="mx-2">•</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    team.is_public 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {team.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={copyInviteLink}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </Button>
              
              {userRole === 'owner' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Settings}
                  onClick={() => navigate(`/teams/${team.id}/settings`)}
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Team Settings
                </Button>
              )}
              
              {userRole !== 'owner' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLeaveTeam}
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Leave Team
                </Button>
              )}
              
              {userRole === 'owner' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDeleteTeam}
                  className="border-red-300 text-red-100 hover:bg-red-500/20"
                >
                  Delete Team
                </Button>
              )}
            </div>
          </div>
          
          {team.description && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/90">{team.description}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {members.length}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="divide-y divide-gray-200">
                  {members.map(member => (
                    <li key={member.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                            {(member.profiles?.full_name || member.profiles?.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.profiles?.full_name || member.profiles?.username || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.role === 'owner' ? 'Team Owner' : 
                               member.role === 'admin' ? 'Team Admin' : 'Member'}
                            </p>
                          </div>
                        </div>
                        
                        {(userRole === 'owner' || userRole === 'admin') && member.role !== 'owner' && member.user_id !== auth.getCurrentUser()?.id && (
                          <button
                            className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={UserPlus}
                    onClick={copyInviteLink}
                    fullWidth
                  >
                    Invite Members
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Certificates */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Team Certificates</h2>
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {certificates.length}
                    </span>
                    <Button
                      size="sm"
                      icon={Plus}
                      onClick={() => setShowAddCertificates(true)}
                    >
                      Add Certificate
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Certificate className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Add certificates to showcase your team's achievements.
                    </p>
                    <Button
                      icon={Plus}
                      onClick={() => setShowAddCertificates(true)}
                    >
                      Add Your First Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map(certificate => (
                      <CertificateCard
                        key={certificate.id}
                        certificate={certificate}
                        onDelete={() => {}} // Implement team certificate removal
                        onEdit={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Certificates Modal */}
      {showAddCertificates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Certificates to Team</h2>
                <button
                  onClick={() => {
                    setShowAddCertificates(false);
                    setSelectedCertificates([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {userCertificates.length === 0 ? (
                <div className="text-center py-8">
                  <Certificate className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Available</h3>
                  <p className="text-gray-600">
                    You don't have any certificates that can be added to this team.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Select certificates from your collection to add to the team.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {userCertificates.map(cert => (
                      <div
                        key={cert.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                          selectedCertificates.includes(cert.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleCertificateSelection(cert.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCertificates.includes(cert.id)}
                            onChange={() => toggleCertificateSelection(cert.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{cert.title}</h4>
                            <p className="text-sm text-gray-500">{cert.organization}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddCertificates(false);
                        setSelectedCertificates([]);
                      }}
                      disabled={addingCertificates}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddCertificates}
                      loading={addingCertificates}
                      disabled={selectedCertificates.length === 0}
                    >
                      Add Selected ({selectedCertificates.length})
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;