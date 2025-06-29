'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  SkipForward,
  Loader2,
  Settings
} from 'lucide-react';
import Button from './Button';
import { ttsService, getSpeechStatus } from '../../utils/textToSpeech';

interface TTSControlsProps {
  text?: string;
  persona?: 'teacher' | 'student' | 'narrator';
  autoPlay?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({
  text,
  persona = 'narrator',
  autoPlay = false,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getSpeechStatus();
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isProcessing);
      setCurrentTime(status.currentTime);
      setDuration(status.duration);
      
      if (status.duration > 0) {
        setProgress((status.currentTime / status.duration) * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && text && !isPlaying && !isLoading) {
      handlePlay();
    }
  }, [autoPlay, text]);

  const handlePlay = async () => {
    if (!text) return;

    try {
      setIsLoading(true);
      onPlayStart?.();
      
      await ttsService.speakAsPersona(text, persona, {
        stability: speechRate === 1.0 ? 0.5 : speechRate * 0.5,
        similarityBoost: 0.75,
      });
      
      onPlayEnd?.();
    } catch (error) {
      console.error('TTS Error:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    ttsService.pauseAudio();
  };

  const handleResume = () => {
    ttsService.resumeAudio();
  };

  const handleStop = () => {
    ttsService.stopAudio();
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSkip = () => {
    ttsService.clearQueue();
    handleStop();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: ElevenLabs doesn't support real-time volume control
    // This would need to be implemented with Web Audio API
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}
    >
      {/* Main Controls */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={isPlaying ? handlePause : (isLoading ? undefined : handlePlay)}
          disabled={!text || isLoading}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          icon={
            isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )
          }
        />

        {/* Stop Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={!isPlaying && !isLoading}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<Square className="h-3 w-3" />}
        />

        {/* Skip Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={!isPlaying && !isLoading}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<SkipForward className="h-3 w-3" />}
        />

        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        />

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<Settings className="h-4 w-4" />}
        />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Speech Rate */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Speech Rate: {speechRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volume */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Persona Info */}
          <div className="mt-3 text-xs text-gray-500">
            <span className="font-medium">Voice:</span> {persona.charAt(0).toUpperCase() + persona.slice(1)}
          </div>
        </motion.div>
      )}

      {/* Status Indicator */}
      {(isPlaying || isLoading) && (
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isLoading && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Generating speech...</span>
              </>
            )}
            {isPlaying && !isLoading && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Playing as {persona}</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TTSControls;