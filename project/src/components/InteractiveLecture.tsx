import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, MessageCircle, User } from 'lucide-react';
import Button from './ui/Button';
import { generateTeacherExplanation, generateStudentQuestion, generateTeacherAnswer } from '@/lib/gemini';

interface Message {
  id: string;
  role: 'teacher' | 'student' | 'user';
  content: string;
  audio?: string;
}

interface InteractiveLectureProps {
  section: {
    title: string;
    content: string;
  };
}

const InteractiveLecture: React.FC<InteractiveLectureProps> = ({ section }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeLecture();
  }, [section]);

  const initializeLecture = async () => {
    setIsProcessing(true);
    try {
      const teacherExplanation = await generateTeacherExplanation(section.content);
      setMessages([
        {
          id: '1',
          role: 'teacher',
          content: teacherExplanation,
        }
      ]);
      
      // Simulate student question after a delay
      setTimeout(async () => {
        const studentQuestion = await generateStudentQuestion(section.content);
        const teacherAnswer = await generateTeacherAnswer(studentQuestion, section.content);
        
        setMessages(prev => [
          ...prev,
          {
            id: '2',
            role: 'student',
            content: studentQuestion,
          },
          {
            id: '3',
            role: 'teacher',
            content: teacherAnswer,
          }
        ]);
      }, 3000);
    } catch (error) {
      console.error('Error initializing lecture:', error);
    }
    setIsProcessing(false);
  };

  const handleUserQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsProcessing(true);
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userQuestion,
      };
      
      setMessages(prev => [...prev, newMessage]);
      setUserQuestion('');
      
      // Generate teacher's response
      const teacherAnswer = await generateTeacherAnswer(userQuestion, section.content);
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'teacher',
          content: teacherAnswer,
        }
      ]);
    } catch (error) {
      console.error('Error handling user question:', error);
    }
    setIsProcessing(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Implement audio playback logic here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
        <div className="flex items-center mt-4">
          <Button
            onClick={togglePlayback}
            variant="outline"
            className="mr-4"
            icon={isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          >
            {isPlaying ? 'Pause Lecture' : 'Start Lecture'}
          </Button>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-4 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role !== 'user' && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'teacher' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
                }`}>
                  {message.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                </div>
              )}
              
              <div className={`flex-1 max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : message.role === 'teacher'
                  ? 'bg-gray-100'
                  : 'bg-secondary-50'
              }`}>
                <p className="text-sm font-medium mb-1">
                  {message.role === 'teacher' ? 'Professor' : message.role === 'student' ? 'Student' : 'You'}
                </p>
                <p className="text-base">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <Button
            onClick={handleUserQuestion}
            disabled={!userQuestion.trim() || isProcessing}
            icon={<MessageCircle className="h-5 w-5" />}
          >
            {isProcessing ? 'Processing...' : 'Ask'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLecture;