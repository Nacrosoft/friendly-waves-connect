
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useMessaging } from '@/context/MessagingContext';
import { Call, User } from '@/types/chat';
import { UserAvatar } from './UserAvatar';
import { useToast } from '@/hooks/use-toast';

interface CallModalProps {
  incomingCall: Call | null;
  activeCall: Call | null;
}

export function CallModal({ incomingCall, activeCall }: CallModalProps) {
  const { acceptCall, declineCall, endCall } = useMessaging();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const { toast } = useToast();
  
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
    if (!incomingCall) return;
    
    toast({
      title: "Call Functionality Under Maintenance",
      description: "We're currently upgrading our call system. Please try again later.",
      variant: "default"
    });
    
    // Still decline the call to close the modal
    try {
      await declineCall(incomingCall.id);
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };
  
  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    
    try {
      await declineCall(incomingCall.id);
      toast({
        title: "Call Declined",
        description: "You declined the incoming call",
      });
    } catch (error) {
      console.error('Error declining call:', error);
      toast({
        title: "Error",
        description: "Failed to decline the call. Please check database configuration.",
        variant: "destructive"
      });
    }
  };
  
  const handleEndCall = async () => {
    if (!activeCall) return;
    
    try {
      await endCall(activeCall.id);
      toast({
        title: "Call Ended",
        description: `Call duration: ${formatTime(callDuration)}`,
      });
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: "Error",
        description: "Failed to end the call properly. Please check database configuration.",
        variant: "destructive"
      });
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: "Call Functionality Under Maintenance",
      description: "Audio controls are temporarily unavailable while we upgrade our systems.",
      variant: "default"
    });
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: "Call Functionality Under Maintenance",
      description: "Video controls are temporarily unavailable while we upgrade our systems.",
      variant: "default"
    });
  };
  
  const renderIncomingCall = () => {
    if (!incomingCall) return null;
    
    const caller = incomingCall.caller;
    
    return (
      <Dialog open={!!incomingCall} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold">Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call</h2>
            <p className="text-center text-muted-foreground mb-2">
              Call functionality is currently under maintenance.
              <br />You can decline this call or try again later.
            </p>
            <div className="rounded-full p-1 border-2 border-primary">
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
    
    const otherParticipant = activeCall.caller && activeCall.recipient ? 
      (activeCall.callerId === activeCall.caller.id ? activeCall.recipient : activeCall.caller) : 
      { name: "Unknown User" } as User;
    
    return (
      <Dialog open={!!activeCall} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold">
              {activeCall.isVideo ? 'Video' : 'Voice'} Call
            </h2>
            <p className="text-center text-muted-foreground mb-2">
              Call functionality is currently under maintenance.
              <br />You can end this call or try again later.
            </p>
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
