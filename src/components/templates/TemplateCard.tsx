import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentDuplicateIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Database } from '../../types/supabase';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useDeleteTemplate } from './hooks/useDeleteTemplate';

type Template = Database['public']['Tables']['templates']['Row'];

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };
  onDelete: () => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutate: deleteTemplate, isLoading: isDeleting } = useDeleteTemplate();

  const handleEdit = () => {
    navigate(`/dashboard/templates/${template.id}/edit`);
  };

  const handleDelete = () => {
    deleteTemplate(template.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Delete template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Created {new Date(template.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/dashboard/templates/${template.id}`)}
          >
            View
          </Button>
          <Button
            onClick={() => navigate(`/dashboard/templates/${template.id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}