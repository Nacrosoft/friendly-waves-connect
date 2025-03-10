
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Volume1, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TextToSpeechProps {
  text: string;
  variant?: "default" | "ghost" | "link" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function TextToSpeech({ text, variant = "ghost", size = "icon", className }: TextToSpeechProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleTextToSpeech = async () => {
    if (isPlaying && audio) {
      // If currently playing, stop the audio
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    
    if (!text.trim()) {
      toast({
        title: "Empty Message",
        description: "There's no text to convert to speech.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Call the edge function to generate speech
      const { data, error } = await supabase.functions.invoke('hume-tts', {
        body: { 
          text: text.trim(),
          // You can make this customizable with a voice selector if needed
          voiceId: "natural-en-male-alan" 
        }
      });

      if (error) {
        console.error("Error generating speech:", error);
        toast({
          title: "Speech Generation Failed",
          description: error.message || "Could not generate speech. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data.success || !data.audioContent) {
        throw new Error(data.error || "Failed to generate audio");
      }

      // Convert base64 to audio
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const newAudio = new Audio(audioSrc);
      
      // Set up event listeners
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      newAudio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Could not play the generated audio.",
          variant: "destructive"
        });
      };
      
      // Play the audio
      await newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
      
      toast({
        title: "Playing Speech",
        description: "Text is being read aloud.",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Text to speech error:", error);
      toast({
        title: "Speech Generation Failed",
        description: error.message || "Could not generate or play speech.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleTextToSpeech}
      variant={variant}
      size={size}
      className={className}
      disabled={isGenerating}
      aria-label={isPlaying ? "Stop speaking" : "Speak message"}
      title={isPlaying ? "Stop speaking" : "Speak message"}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <Volume1 className="h-4 w-4" />
      )}
    </Button>
  );
}
