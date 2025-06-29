import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import Button from './ui/Button';
import { Question } from '../types';
import { generateId } from '../utils/helpers';

interface QuestionAnsweringProps {
  lectureId: string;
  sectionId: string;
  onClose: () => void;
  onQuestionAnswered: (question: Question) => void;
}

const QuestionAnswering: React.FC<QuestionAnsweringProps> = ({ 
  lectureId, 
  sectionId, 
  onClose,
  onQuestionAnswered
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call to get answer
    setTimeout(() => {
      // Example answer generation
      const generatedAnswer = `To answer your question about "${question}": 
      
This is a simulated AI response that would typically provide a detailed, educational answer based on the lecture content. In a real implementation, this would connect to an AI model that analyzes the document content and generates appropriate responses to help clarify concepts from the lecture.

The answer would be tailored to the specific section of the lecture being discussed, drawing from the document's content to provide context-relevant information.`;
      
      setAnswer(generatedAnswer);
      setIsLoading(false);
      
      // Create question object
      const newQuestion: Question = {
        id: generateId(),
        lectureId,
        sectionId,
        question,
        answer: generatedAnswer,
        createdAt: new Date().toISOString(),
      };
      
      onQuestionAnswered(newQuestion);
    }, 2000);
  };
  
  const resetForm = () => {
    setQuestion('');
    setAnswer(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-apple-md border border-gray-200 overflow-hidden max-w-2xl w-full"
    >
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Ask a question</h2>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={onClose}
          icon={<X className="h-4 w-4" />}
        />
      </div>
      
      <div className="p-6">
        {!answer ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Your question:
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question about this section..."
                className="w-full p-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none min-h-[100px]"
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isLoading}
                disabled={!question.trim()}
                icon={<Send className="h-4 w-4" />}
              >
                {isLoading ? 'Thinking...' : 'Ask'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Your question:</h3>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{question}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Answer:</h3>
              <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{answer}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Ask another question
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionAnswering;