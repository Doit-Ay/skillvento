import React from 'react';
import { Users } from 'lucide-react';

const TeamCollaboration: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Collaboration</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Build amazing team portfolios together!</p>
    </div>
  </div>
);

export default TeamCollaboration;