
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { Call } from '@/types/chat';
import { useMessaging } from '@/context/MessagingContext';
import { Phone, Video, MicOff, VideoOff, X, PhoneOff } from 'lucide-react';

interface CallModalProps {
  incomingCall?: Call | null;
  activeCall?: Call | null;
  onAccept?: (callId: string) => void;
  onDecline?: (callId: string) => void;
  onEnd?: (callId: string) => void;
}

export function CallModal({ 
  incomingCall, 
  activeCall, 
  onAccept, 
  onDecline, 
  onEnd 
}: CallModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timer | null>(null);
  
  // If we're using the context directly
  const { 
    incomingCall: contextIncomingCall, 
    activeCall: contextActiveCall,
    acceptCall: contextAcceptCall,
    declineCall: contextDeclineCall,
    endCall: contextEndCall  
  } = useMessaging();
  
  // Use either props or context values
  const call = incomingCall || activeCall || contextIncomingCall || contextActiveCall;
  
  // Set isOpen whenever we have a call
  useEffect(() => {
    if (call) {
      setIsOpen(true);
      
      // If it's an active call, start the timer
      if (call.status === 'active') {
        const interval = setInterval(() => {
          setCallTimer(prev => prev + 1);
        }, 1000);
        
        setTimerInterval(interval);
      }
    } else {
      setIsOpen(false);
      setCallTimer(0);
      
      // Clear the timer if it exists
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [call, timerInterval]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAccept = () => {
    if (call) {
      if (onAccept) {
        onAccept(call.id);
      } else if (contextAcceptCall) {
        contextAcceptCall(call.id);
      }
    }
  };
  
  const handleDecline = () => {
    if (call) {
      if (onDecline) {
        onDecline(call.id);
      } else if (contextDeclineCall) {
        contextDeclineCall(call.id);
      }
    }
  };
  
  const handleEnd = () => {
    if (call) {
      if (onEnd) {
        onEnd(call.id);
      } else if (contextEndCall) {
        contextEndCall(call.id);
      }
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };
  
  if (!call) return null;
  
  // Determine who to show in the UI (for caller, show recipient; for recipient, show caller)
  const otherUser = call.callerId === (contextIncomingCall?.recipientId || contextActiveCall?.recipientId) 
    ? call.recipient 
    : call.caller;
    
  const isIncoming = call.status === 'pending' && call.recipientId === (contextIncomingCall?.recipientId || contextActiveCall?.recipientId);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className={`flex flex-col items-center justify-between h-96 p-6 ${call.isVideo ? 'bg-black' : 'bg-gradient-to-b from-primary/20 to-primary/5'}`}>
          <div className="w-full flex justify-between items-center">
            <span className="text-sm font-medium">
              {call.status === 'active'
                ? 'On call'
                : isIncoming 
                  ? 'Incoming call'
                  : 'Calling...'}
            </span>
            {call.status === 'active' && (
              <span className="text-sm font-medium">{formatTime(callTimer)}</span>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            {call.isVideo && call.status === 'active' ? (
              <div className="relative w-full h-full bg-black/30 rounded-lg flex items-center justify-center">
                {!isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center text-center text-white/50">
                    <p>Video stream would appear here</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserAvatar 
                      user={otherUser} 
                      className="w-24 h-24" 
                    />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 w-24 h-36 bg-black/40 rounded-lg flex items-center justify-center">
                  <p className="text-xs text-white/50">Your camera</p>
                </div>
              </div>
            ) : (
              <>
                <UserAvatar 
                  user={otherUser} 
                  className="w-24 h-24" 
                />
                <h3 className="text-xl font-semibold">{otherUser.name}</h3>
                <p className="text-muted-foreground">
                  {call.status === 'active'
                    ? 'On call'
                    : isIncoming 
                      ? 'Incoming call'
                      : 'Calling...'}
                </p>
              </>
            )}
          </div>
          
          <div className="flex gap-4 justify-center mt-4">
            {call.status === 'pending' ? (
              isIncoming ? (
                <>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="rounded-full h-12 w-12"
                    onClick={handleDecline}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-green-500 hover:bg-green-600"
                    onClick={handleAccept}
                  >
                    {call.isVideo ? (
                      <Video className="h-6 w-6" />
                    ) : (
                      <Phone className="h-6 w-6" />
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full h-12 w-12"
                  onClick={handleDecline}
                >
                  <X className="h-6 w-6" />
                </Button>
              )
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-full h-10 w-10 ${isMuted ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white' : ''}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <span className="i-lucide-mic h-5 w-5"></span>}
                </Button>
                
                {call.isVideo && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`rounded-full h-10 w-10 ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white' : ''}`}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full h-12 w-12"
                  onClick={handleEnd}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
