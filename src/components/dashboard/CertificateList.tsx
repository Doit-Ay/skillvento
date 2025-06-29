import React from 'react';
import { Calendar, Building, Tag, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Certificate } from '../../types';
import { storage } from '../../lib/supabase';
import { format } from 'date-fns';

interface CertificateListProps {
  certificates: Certificate[];
  onDelete: (id: string) => void;
}

const CertificateList: React.FC<CertificateListProps> = ({ certificates, onDelete }) => {
  const handleView = (certificate: Certificate) => {
    const { data: fileUrl } = storage.getPublicUrl(certificate.file_url);
    window.open(fileUrl.publicUrl, '_blank');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Certificate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organization
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {certificates.map((certificate) => (
            <tr key={certificate.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {certificate.certificate_type === 'image' ? (
                      <img
                        className="h-10 w-10 rounded object-cover"
                        src={storage.getPublicUrl(certificate.file_url).data.publicUrl}
                        alt={certificate.title}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                        <ExternalLink className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {certificate.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {certificate.tags.slice(0, 2).join(', ')}
                      {certificate.tags.length > 2 && '...'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {certificate.organization}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {certificate.domain}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(certificate.issued_on), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  {certificate.is_verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  {certificate.is_public && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Public
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(certificate)}
                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(certificate.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificateList;