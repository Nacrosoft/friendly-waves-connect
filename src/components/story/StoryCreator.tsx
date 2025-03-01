
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

export function StoryCreator() {
  const { isCreatingStory, setIsCreatingStory, createStory } = useStory();
  const [activeTab, setActiveTab] = useState('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [bgColor, setBgColor] = useState('#3B82F6'); // Default blue
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    setBgColor('#3B82F6');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Create Story</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-0">
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-[300px] mx-auto rounded-md"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6" 
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
                    <Camera className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
            </div>
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => videoInputRef.current?.click()}
              >
                {videoPreview ? (
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="max-h-[300px] mx-auto rounded-md"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6" 
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
                    <Video className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Click to upload a video
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <div className="space-y-4">
              <div 
                className="rounded-lg p-6 min-h-[200px] flex flex-col text-white"
                style={{ backgroundColor: bgColor }}
              >
                <Textarea
                  placeholder="Type your story text here..."
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-xl text-center placeholder:text-white/50"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Share Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
