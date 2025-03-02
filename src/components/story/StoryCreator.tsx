
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStory } from '@/context/StoryContext';
import { useToast } from '@/hooks/use-toast';
import { Image, Video, Type, X, Camera, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StoryCreator() {
  const { isCreatingStory, setIsCreatingStory, createStory } = useStory();
  const [activeTab, setActiveTab] = useState('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [bgColor, setBgColor] = useState('#4F46E5'); // Modern indigo color
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Gradient presets for text stories
  const gradientPresets = [
    'linear-gradient(to right, #4F46E5, #7C3AED)', // Indigo to Purple
    'linear-gradient(to right, #EC4899, #8B5CF6)', // Pink to Purple
    'linear-gradient(to right, #3B82F6, #10B981)', // Blue to Green
    'linear-gradient(to right, #F59E0B, #EF4444)', // Amber to Red
    'linear-gradient(to right, #06B6D4, #3B82F6)', // Cyan to Blue
  ];

  const handleClose = () => {
    setIsCreatingStory(false);
    resetForm();
  };

  const resetForm = () => {
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
    setTextContent('');
    setBgColor('#4F46E5');
    setActiveTab('image');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Video size should be less than 50MB',
        variant: 'destructive',
      });
      return;
    }

    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'image' && imageFile) {
        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          createStory('image', base64data);
        };
      } else if (activeTab === 'video' && videoFile) {
        // Convert video to base64
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          createStory('video', base64data);
        };
      } else if (activeTab === 'text' && textContent.trim()) {
        // Create text story
        createStory('text', textContent, bgColor);
      } else {
        toast({
          title: 'Content required',
          description: 'Please add content to your story',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to create story',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isCreatingStory} onOpenChange={setIsCreatingStory}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-accent/5 border-border/50 p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
          <DialogTitle className="text-center">Create Story</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 p-1 mx-4 mt-4 bg-muted/50">
            <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20">
              <Type className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
          </TabsList>

          <div className="px-4 pb-4">
            <TabsContent value="image" className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div 
                  key="image-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div 
                    className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-[300px] mx-auto rounded-lg shadow-md"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-7 w-7 rounded-full" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Camera className="h-12 w-12 mx-auto text-primary/60" />
                        </motion.div>
                        <p className="mt-2 text-sm text-foreground/80">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG or GIF (max. 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div 
                  key="video-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div 
                    className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {videoPreview ? (
                      <div className="relative">
                        <video 
                          src={videoPreview} 
                          controls 
                          className="max-h-[300px] mx-auto rounded-lg shadow-md"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-7 w-7 rounded-full" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoFile(null);
                            setVideoPreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Video className="h-12 w-12 mx-auto text-primary/60" />
                        </motion.div>
                        <p className="mt-2 text-sm text-foreground/80">
                          Click to upload a video
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          MP4, MOV or WEBM (max. 50MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div 
                  key="text-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div 
                    className="rounded-xl p-6 min-h-[200px] flex flex-col text-white shadow-md"
                    style={{ 
                      background: bgColor.includes('gradient') ? bgColor : `linear-gradient(135deg, ${bgColor}, ${adjustColorBrightness(bgColor, -20)})`
                    }}
                  >
                    <Textarea
                      placeholder="Type your story text here..."
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-xl text-center placeholder:text-white/50"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="bg-color" className="text-sm">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bg-color"
                        type="color"
                        value={bgColor.includes('gradient') ? '#4F46E5' : bgColor}
                        onChange={(e) => {
                          // If a gradient was selected, switch to solid color
                          setBgColor(e.target.value);
                        }}
                        className="w-12 h-9 cursor-pointer p-1"
                      />
                      <div className="flex-1">
                        <div className="grid grid-cols-5 gap-2">
                          {gradientPresets.map((gradient, index) => (
                            <button
                              key={index}
                              className={`h-9 rounded-md cursor-pointer transition-all duration-200 ${bgColor === gradient ? 'ring-2 ring-primary' : 'ring-1 ring-border/50'}`}
                              style={{ background: gradient }}
                              onClick={() => setBgColor(gradient)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="story-gradient" onClick={handleSubmit}>
            Share Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number) {
  // Remove the # if it exists
  hex = hex.replace(/^#/, '');
  
  // Parse the hex string
  let r = parseInt(hex.length === 3 ? hex.substring(0, 1).repeat(2) : hex.substring(0, 2), 16);
  let g = parseInt(hex.length === 3 ? hex.substring(1, 2).repeat(2) : hex.substring(2, 4), 16);
  let b = parseInt(hex.length === 3 ? hex.substring(2, 3).repeat(2) : hex.substring(4, 6), 16);
  
  // Adjust the brightness
  r = Math.round(r * (100 + percent) / 100);
  g = Math.round(g * (100 + percent) / 100);
  b = Math.round(b * (100 + percent) / 100);
  
  // Ensure values stay within range
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
