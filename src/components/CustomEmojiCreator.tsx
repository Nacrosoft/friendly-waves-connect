
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageIcon, VideoIcon, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { CustomEmoji } from '@/types/chat';
import { saveCustomEmoji, deleteCustomEmoji } from '@/utils/database';

interface CustomEmojiCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiCreated?: (emoji: CustomEmoji) => void;
}

const CustomEmojiCreator: React.FC<CustomEmojiCreatorProps> = ({ 
  open, 
  onOpenChange,
  onEmojiCreated 
}) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmojis, setUserEmojis] = useState<CustomEmoji[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Load user's custom emojis when dialog opens
  React.useEffect(() => {
    if (open && currentUser) {
      // If user has custom emojis in their profile, show them
      if (currentUser.customEmojis && currentUser.customEmojis.length > 0) {
        setUserEmojis(currentUser.customEmojis);
      }
    }
  }, [open, currentUser]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if file is an image or video
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image or video file',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'File size should be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Create a preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !file || !name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and select a file',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert file to base64 for storage
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const newEmoji: CustomEmoji = {
          id: `emoji-${Date.now()}`,
          name: name.trim(),
          url: base64String,
          type: fileType as 'image' | 'video',
          createdAt: new Date(),
          userId: currentUser.id
        };
        
        // Save emoji to database
        await saveCustomEmoji(newEmoji);
        
        // Update local state
        setUserEmojis(prev => [...prev, newEmoji]);
        
        // Notify parent component
        if (onEmojiCreated) {
          onEmojiCreated(newEmoji);
        }
        
        // Reset form
        setName('');
        setFile(null);
        setPreviewUrl(null);
        
        toast({
          title: 'Custom emoji created',
          description: `Your emoji "${name}" has been created successfully`,
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error creating emoji:', error);
      toast({
        title: 'Error',
        description: 'Failed to create custom emoji',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (emoji: CustomEmoji) => {
    if (!currentUser) return;
    
    try {
      await deleteCustomEmoji(emoji.id, currentUser.id);
      
      // Update local state
      setUserEmojis(prev => prev.filter(e => e.id !== emoji.id));
      
      toast({
        title: 'Emoji deleted',
        description: `Your emoji "${emoji.name}" has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting emoji:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete custom emoji',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Emoji Creator</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <Label htmlFor="name">Emoji Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="happy_face"
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-4">
            <Label htmlFor="file-upload">Upload Image or Video</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                {file ? 'Change File' : 'Select File'}
              </Button>
              
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {previewUrl && (
              <div className="relative w-24 h-24 mx-auto border rounded-md overflow-hidden">
                {file?.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                  />
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !file}>
              {isSubmitting ? 'Creating...' : 'Create Emoji'}
            </Button>
          </DialogFooter>
        </form>
        
        {userEmojis.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Your Custom Emojis</h3>
            <div className="grid grid-cols-4 gap-2">
              {userEmojis.map((emoji) => (
                <div key={emoji.id} className="relative group">
                  <div className="w-12 h-12 border rounded-md overflow-hidden flex items-center justify-center">
                    {emoji.type === 'image' ? (
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <video
                        src={emoji.url}
                        className="max-w-full max-h-full object-contain"
                        autoPlay
                        muted
                        loop
                      />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(emoji)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-center block mt-1 truncate w-full">
                    {emoji.name}
                  </span>
                </div>
              ))}
              
              {/* Add new emoji shortcut */}
              <Button
                variant="outline"
                className="w-12 h-12 flex items-center justify-center"
                onClick={() => {
                  setName('');
                  setFile(null);
                  setPreviewUrl(null);
                }}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomEmojiCreator;
