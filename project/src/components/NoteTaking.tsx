import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit } from 'lucide-react';
import Button from './ui/Button';
import { Note } from '../types';
import { generateId } from '../utils/helpers';

interface NoteTakingProps {
  lectureId: string;
  sectionId: string;
  initialNote?: Note;
  onSave: (note: Note) => void;
}

const NoteTaking: React.FC<NoteTakingProps> = ({ 
  lectureId, 
  sectionId, 
  initialNote, 
  onSave 
}) => {
  const [content, setContent] = useState(initialNote?.content || '');
  const [isEditing, setIsEditing] = useState(!initialNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    
    // Create or update note
    const note: Note = initialNote 
      ? {
          ...initialNote,
          content,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: generateId(),
          lectureId,
          sectionId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
    
    // Simulate API call
    setTimeout(() => {
      onSave(note);
      setIsEditing(false);
      setIsSaving(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-apple-sm border border-gray-100 overflow-hidden h-full flex flex-col"
    >
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Notes</h2>
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            loading={isSaving}
            onClick={handleSave}
            icon={<Save className="h-4 w-4" />}
          >
            Save
          </Button>
        )}
      </div>
      
      <div className="p-6 flex-1">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take notes on this section..."
            className="w-full h-full min-h-[200px] p-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            autoFocus
          />
        ) : (
          <div className="prose max-w-none">
            {content ? (
              <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
            ) : (
              <p className="text-gray-400 italic">No notes yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteTaking;