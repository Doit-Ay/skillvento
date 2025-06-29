import React from 'react';
import { Brain } from 'lucide-react';

const AICareerMentor: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-yellow-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <Brain className="h-8 w-8 text-yellow-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Career Mentor</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Get personalized career advice from AI!</p>
    </div>
  </div>
);

export default AICareerMentor;