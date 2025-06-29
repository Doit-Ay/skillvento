import React from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Certificate } from '../../types';

interface VerificationBadgeProps {
  certificate: Certificate;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  certificate, 
  size = 'md',
  showLabel = true
}) => {
  const getVerificationStatus = () => {
    if (certificate.verification_status === 'verified' || certificate.is_verified) {
      return 'verified';
    } else if (certificate.verification_status === 'rejected') {
      return 'rejected';
    } else {
      return 'pending';
    }
  };
  
  const status = getVerificationStatus();
  
  const sizeClasses = {
    sm: {
      badge: 'h-5 w-5',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    md: {
      badge: 'h-6 w-6',
      icon: 'h-4 w-4',
      text: 'text-sm'
    },
    lg: {
      badge: 'h-8 w-8',
      icon: 'h-5 w-5',
      text: 'text-base'
    }
  };
  
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      label: 'Verified'
    },
    rejected: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      label: 'Not Verified'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      label: 'Pending Verification'
    }
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  if (!showLabel) {
    return (
      <div className={`${config.bgColor} ${sizeClasses[size].badge} rounded-full flex items-center justify-center`} title={config.label}>
        <StatusIcon className={`${config.textColor} ${sizeClasses[size].icon}`} />
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center ${config.bgColor} ${config.textColor} px-2 py-1 rounded-full border ${config.borderColor}`}>
      <StatusIcon className={`${sizeClasses[size].icon} mr-1`} />
      <span className={sizeClasses[size].text}>{config.label}</span>
    </div>
  );
};

export default VerificationBadge;