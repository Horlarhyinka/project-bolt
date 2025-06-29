'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, ChevronLeft, MessageCircle, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import LectureContent from '../components/LectureContent';
import LectureDiscussion from '../components/LectureDiscussion';
import NoteTaking from '../components/NoteTaking';
import QuestionAnswering from '../components/QuestionAnswering';
import { mockLecture, mockNotes, mockQuestions } from '../utils/mockData';
import { Note, Question } from '../types';

const LecturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [activeView, setActiveView] = useState<'content' | 'discussion' | 'notes'>('content');
  const [sectionStartTime, setSectionStartTime] = useState<Date>(new Date());
  
  // Get current section
  const currentSection = mockLecture.sections[currentSectionIndex];
  
  // Get current note for this section
  const currentNote = notes.find(note => note.sectionId === currentSection.id);
  
  // Track section changes for discussion reset
  useEffect(() => {
    setSectionStartTime(new Date());
  }, [currentSectionIndex]);
  
  // Navigate to previous section
  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setActiveView('content'); // Reset to content view
    }
  };
  
  // Navigate to next section
  const goToNextSection = () => {
    if (currentSectionIndex < mockLecture.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setActiveView('content'); // Reset to content view
    }
  };
  
  // Handle saving note
  const handleSaveNote = (note: Note) => {
    setNotes(prev => {
      const noteIndex = prev.findIndex(n => n.id === note.id);
      if (noteIndex >= 0) {
        // Update existing note
        const updatedNotes = [...prev];
        updatedNotes[noteIndex] = note;
        return updatedNotes;
      } else {
        // Add new note
        return [...prev, note];
      }
    });
  };
  
  // Handle saving question
  const handleQuestionAnswered = (question: Question) => {
    setQuestions(prev => [...prev, question]);
    // Close modal after a delay
    setTimeout(() => {
      setShowQuestionModal(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 p-4 flex-shrink-0"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate.push('/documents')}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Documents
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockLecture.title}</h1>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <span className="mr-2">Section {currentSectionIndex + 1} of {mockLecture.sections.length}:</span>
              <span className="font-medium text-gray-700">{currentSection.title}</span>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('content')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'content'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-1" />
              Content
            </button>
            <button
              onClick={() => setActiveView('discussion')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'discussion'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-1" />
              Discussion
            </button>
            <button
              onClick={() => setActiveView('notes')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'notes'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notes
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <LectureContent 
                section={currentSection} 
                onAskQuestion={() => setShowQuestionModal(true)}
              />
            </motion.div>
          )}
          
          {activeView === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <LectureDiscussion 
                section={currentSection}
                isActive={activeView === 'discussion'}
              />
            </motion.div>
          )}
          
          {activeView === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <NoteTaking
                lectureId={mockLecture.id}
                sectionId={currentSection.id}
                initialNote={currentNote}
                onSave={handleSaveNote}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
        <Button
          variant="outline"
          onClick={goToPrevSection}
          disabled={currentSectionIndex === 0}
          icon={<ChevronLeft className="h-5 w-5" />}
        >
          Previous Section
        </Button>
        
        {/* Section Progress */}
        <div className="flex items-center space-x-2">
          {mockLecture.sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSectionIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSectionIndex
                  ? 'bg-primary-500'
                  : index < currentSectionIndex
                  ? 'bg-primary-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={goToNextSection}
          disabled={currentSectionIndex === mockLecture.sections.length - 1}
          icon={<ChevronRight className="h-5 w-5 ml-2" />}
        >
          Next Section
        </Button>
      </div>
      
      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <QuestionAnswering
              lectureId={mockLecture.id}
              sectionId={currentSection.id}
              onClose={() => setShowQuestionModal(false)}
              onQuestionAnswered={handleQuestionAnswered}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LecturePage;