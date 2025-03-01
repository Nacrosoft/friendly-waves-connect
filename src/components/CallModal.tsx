
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Check, X } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  callType: 'voice' | 'video' | null;
  isIncoming?: boolean;
}

export function CallModal({ isOpen, onClose, user, callType, isIncoming = false }: CallModalProps) {
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(isIncoming);
  const { toast } = useToast();
  const timerRef = useRef<number | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create ring audio element
  useEffect(() => {
    if (isIncoming && isRinging) {
      // Create audio element for ringing sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.loop = true;
      audio.play().catch(err => console.error("Could not play ringtone:", err));
      ringAudioRef.current = audio;
      
      return () => {
        if (ringAudioRef.current) {
          ringAudioRef.current.pause();
          ringAudioRef.current = null;
        }
      };
    }
  }, [isIncoming, isRinging]);
  
  // Auto-close call if not accepted after 30 seconds
  useEffect(() => {
    let ringTimeout: number | null = null;
    
    if (isIncoming && isRinging) {
      ringTimeout = window.setTimeout(() => {
        if (!isCallAccepted) {
          toast({
            title: "Missed call",
            description: `You missed a ${callType} call from ${user.name}.`,
          });
          onClose();
        }
      }, 30000); // 30 seconds timeout
    }
    
    return () => {
      if (ringTimeout) clearTimeout(ringTimeout);
    };
  }, [isIncoming, isRinging, isCallAccepted, callType, user.name, toast, onClose]);
  
  // Simulate call connecting for outgoing calls
  useEffect(() => {
    if (isOpen && !isIncoming && !isCallConnected && isCallAccepted) {
      // Simulate call connection after 2 seconds
      const timer = setTimeout(() => {
        setIsCallConnected(true);
        toast({
          title: "Call connected",
          description: `${callType === 'voice' ? 'Voice' : 'Video'} call with ${user.name} is now connected.`,
        });
        
        // Start call duration timer
        startCallTimer();
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, isIncoming, isCallConnected, isCallAccepted, callType, user.name, toast]);
  
  // Handle call timer
  const startCallTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };
  
  // Format call duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current = null;
      }
    };
  }, []);
  
  // Handle accepting a call
  const handleAcceptCall = () => {
    // Stop ringing sound
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current = null;
    }
    
    setIsRinging(false);
    setIsCallAccepted(true);
    
    if (callType === 'video') {
      // Simulate accessing camera for video calls
      const simulateVideoStream = async () => {
        try {
          // For demo purposes, we'll just simulate it
          setIsCallConnected(true);
          startCallTimer();
          
          toast({
            title: "Call accepted",
            description: `You've joined a ${callType} call with ${user.name}.`,
          });
        } catch (error) {
          console.error('Error accessing media devices:', error);
          toast({
            title: "Camera access denied",
            description: "Could not access camera for video call.",
            variant: "destructive"
          });
          onClose();
        }
      };
      
      simulateVideoStream();
    } else {
      // For voice calls, just connect immediately
      setIsCallConnected(true);
      startCallTimer();
      
      toast({
        title: "Call accepted",
        description: `You've joined a voice call with ${user.name}.`,
      });
    }
  };
  
  // Handle declining a call
  const handleDeclineCall = () => {
    // Stop ringing sound
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current = null;
    }
    
    toast({
      title: "Call declined",
      description: `You declined a ${callType} call from ${user.name}.`,
    });
    
    onClose();
  };
  
  // Simulate accessing camera when video call is initiated
  useEffect(() => {
    if (isOpen && callType === 'video' && !isIncoming && localVideoRef.current) {
      // Simulate video streams with placeholder
      const simulateVideoStream = async () => {
        try {
          // In a real implementation, you would use:
          // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          // localVideoRef.current.srcObject = stream;
          
          // For demo purposes, we'll just show a placeholder
          setIsCallAccepted(true);
        } catch (error) {
          console.error('Error accessing media devices:', error);
          toast({
            title: "Camera access denied",
            description: "Could not access camera for video call.",
            variant: "destructive"
          });
          onClose();
        }
      };
      
      simulateVideoStream();
    }
  }, [isOpen, callType, isIncoming, toast, onClose]);
  
  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    toast({
      title: "Call ended",
      description: `Call with ${user.name} has ended. Duration: ${formatDuration(callDuration)}.`,
    });
    
    onClose();
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Your microphone is now active." : "Your microphone has been muted.",
    });
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? "Video enabled" : "Video disabled",
      description: isVideoOff ? "Your camera is now active." : "Your camera has been turned off.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRinging
              ? `Incoming ${callType === 'voice' ? 'Voice' : 'Video'} Call`
              : isCallConnected
                ? `${callType === 'voice' ? 'Voice' : 'Video'} Call with ${user.name}`
                : `Calling ${user.name}...`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Avatar and call status */}
          <div className="text-center">
            <Avatar className={`h-24 w-24 mx-auto mb-4 border-2 ${isRinging ? 'animate-pulse border-primary' : 'border-primary'}`}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-3xl">{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            
            {isCallConnected && (
              <div className="mt-2 text-xl">
                {formatDuration(callDuration)}
              </div>
            )}
            
            {!isCallConnected && !isRinging && (
              <div className="animate-pulse text-muted-foreground">
                Connecting...
              </div>
            )}
            
            {isRinging && (
              <div className="text-lg font-medium mb-2">
                {user.name} is calling you...
              </div>
            )}
          </div>
          
          {/* Video elements for video calls */}
          {callType === 'video' && isCallAccepted && !isRinging && (
            <div className="w-full relative rounded-lg overflow-hidden bg-black aspect-video">
              {/* Remote video (full-size) */}
              <div className={`w-full h-full ${isVideoOff ? 'bg-gray-800' : ''}`}>
                {!isVideoOff && (
                  <video
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  >
                    Your browser doesn't support video calls.
                  </video>
                )}
                
                {/* Show avatar if video is off */}
                {isVideoOff && (
                  <div className="flex items-center justify-center w-full h-full">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-4 right-4 w-1/3 aspect-video rounded overflow-hidden border-2 border-background shadow-lg">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                >
                  Your browser doesn't support video calls.
                </video>
              </div>
            </div>
          )}
          
          {/* Call controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* For incoming calls - accept/decline buttons */}
            {isRinging && (
              <>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-14 w-14"
                  onClick={handleDeclineCall}
                >
                  <X className="h-7 w-7" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
                  onClick={handleAcceptCall}
                >
                  <Check className="h-7 w-7" />
                </Button>
              </>
            )}
            
            {/* For connected calls - normal controls */}
            {isCallAccepted && !isRinging && (
              <>
                {/* Toggle microphone */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                {/* End call button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-14 w-14"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>
                
                {/* Toggle video if it's a video call */}
                {callType === 'video' && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
