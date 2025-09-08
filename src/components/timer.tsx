'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  title?: string;
  onComplete?: () => void;
  className?: string;
}

export default function Timer({
  initialMinutes = 0,
  initialSeconds = 0,
  title = 'Timer',
  onComplete,
  className = '',
}: TimerProps) {
  const { data: session } = useSession();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(initialMinutes.toString());
  const [editSeconds, setEditSeconds] = useState(initialSeconds.toString());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for notification sound
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/timer-bell.mp3');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              // Timer completed
              setIsActive(false);
              setIsCompleted(true);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              
              // Play notification sound
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.error('Error playing sound:', e));
              }
              
              // Show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Timer Completed', {
                  body: `${title} has finished!`,
                  icon: '/favicon.ico',
                });
              } else {
                toast.success(`${title} has finished!`);
              }
              
              // Call onComplete callback if provided
              if (onComplete) {
                onComplete();
              }
              
              return 0;
            }
            setMinutes(prevMinutes => prevMinutes - 1);
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, title, onComplete]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success('Notifications enabled for timers');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const handleStartPause = () => {
    if (isCompleted) {
      // Reset timer if it was completed
      setMinutes(initialMinutes);
      setSeconds(initialSeconds);
      setIsCompleted(false);
    }
    
    // Request notification permission on first interaction
    if (session && isActive === false) {
      requestNotificationPermission();
    }
    
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const handleSaveEdit = () => {
    const newMinutes = parseInt(editMinutes) || 0;
    const newSeconds = parseInt(editSeconds) || 0;
    
    if (newMinutes < 0 || newSeconds < 0 || newSeconds >= 60) {
      toast.error('Please enter a valid time');
      return;
    }
    
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    setIsEditing(false);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <TimerIcon className="h-5 w-5 mr-2" />
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isActive}
          >
            Edit
          </Button>
        </div>
      </CardHeader>
      
      <CardBody>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutes
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="w-20 text-center"
                />
              </div>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seconds
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(e.target.value)}
                  className="w-20 text-center"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button
                variant="primary"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditMinutes(minutes.toString());
                  setEditSeconds(seconds.toString());
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${isCompleted ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {formatTime(minutes)}:{formatTime(seconds)}
              </div>
              {isCompleted && (
                <div className="flex items-center justify-center text-green-600 mt-2">
                  <Bell className="h-4 w-4 mr-1" />
                  <span className="text-sm">Timer completed!</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button
                variant={isActive ? "secondary" : "primary"}
                onClick={handleStartPause}
                className="flex items-center"
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    {isCompleted ? 'Restart' : 'Start'}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={minutes === initialMinutes && seconds === initialSeconds}
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}