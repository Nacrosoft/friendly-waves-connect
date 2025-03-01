
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useMessaging } from '@/context/MessagingContext';
import { Call, User } from '@/types/chat';
import { UserAvatar } from './UserAvatar';

interface CallModalProps {
  incomingCall: Call | null;
  activeCall: Call | null;
}

export function CallModal({ incomingCall, activeCall }: CallModalProps) {
  const { acceptCall, declineCall, endCall } = useMessaging();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeCall) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeCall]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAcceptCall = async () => {
    if (incomingCall) {
      try {
        await acceptCall(incomingCall.id);
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    }
  };
  
  const handleDeclineCall = async () => {
    if (incomingCall) {
      try {
        await declineCall(incomingCall.id);
      } catch (error) {
        console.error('Error declining call:', error);
      }
    }
  };
  
  const handleEndCall = async () => {
    if (activeCall) {
      try {
        await endCall(activeCall.id);
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };
  
  const renderIncomingCall = () => {
    if (!incomingCall) return null;
    
    const caller = incomingCall.caller;
    
    return (
      <Dialog open={!!incomingCall} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <h2 className="text-xl font-semibold">Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call</h2>
            <div className="rounded-full p-1 border-2 border-primary animate-pulse">
              <UserAvatar user={caller} className="h-24 w-24" />
            </div>
            <p className="text-lg font-medium">{caller.name}</p>
            
            <div className="flex space-x-4 mt-6">
              <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-full w-14 h-14 p-0"
                onClick={handleDeclineCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button 
                variant="default" 
                size="lg" 
                className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
                onClick={handleAcceptCall}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  const renderActiveCall = () => {
    if (!activeCall) return null;
    
    const otherParticipant = activeCall.callerId === (activeCall.caller?.id || '') 
      ? activeCall.recipient 
      : activeCall.caller;
    
    return (
      <Dialog open={!!activeCall} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <h2 className="text-xl font-semibold">
              {activeCall.isVideo ? 'Video' : 'Voice'} Call
            </h2>
            <div className="rounded-full p-1 border-2 border-primary">
              <UserAvatar user={otherParticipant} className="h-24 w-24" />
            </div>
            <p className="text-lg font-medium">{otherParticipant.name}</p>
            <p className="text-sm text-muted-foreground">{formatTime(callDuration)}</p>
            
            <div className="flex space-x-3 mt-6">
              <Button 
                variant={isMuted ? "outline" : "secondary"} 
                size="sm" 
                className="rounded-full w-12 h-12 p-0"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              {activeCall.isVideo && (
                <Button 
                  variant={isVideoOff ? "outline" : "secondary"} 
                  size="sm" 
                  className="rounded-full w-12 h-12 p-0"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-full w-14 h-14 p-0"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <>
      {renderIncomingCall()}
      {renderActiveCall()}
    </>
  );
}
