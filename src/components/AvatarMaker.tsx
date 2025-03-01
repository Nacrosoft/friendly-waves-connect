
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  UserRound, 
  Smile, 
  Palette, 
  Glasses, 
  Shirt, 
  RefreshCw,
  Crown,
  VenetianMask
} from 'lucide-react';
import { User as UserType } from '@/types/chat';
import { saveUser } from '@/utils/database';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const AVATAR_BASE_URL = 'https://api.dicebear.com/7.x';
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoonish', icon: <Smile className="h-4 w-4" /> },
  { id: 'bottts', name: 'Robots', icon: <User className="h-4 w-4" /> },
  { id: 'personas', name: 'Personas', icon: <UserRound className="h-4 w-4" /> },
  { id: 'pixel-art', name: 'Pixel Art', icon: <Palette className="h-4 w-4" /> },
  { id: 'lorelei', name: 'Lorelei', icon: <Glasses className="h-4 w-4" /> },
  { id: 'adventurer', name: 'Adventurer', icon: <Shirt className="h-4 w-4" /> },
];

// Customization options for each avatar style
const AVATAR_OPTIONS: Record<string, {[key: string]: string[]}> = {
  'avataaars': {
    'Accessories': ['glasses', 'eyepatch', 'sunglasses', 'none'],
    'Beard': ['light', 'medium', 'majestic', 'none'],
    'Clothes Color': ['blue', 'black', 'red', 'green', 'pink'],
    'Facial Hair': ['mustache', 'goatee', 'none'],
    'Hair Color': ['blonde', 'brown', 'black', 'red', 'gray', 'platinum'],
    'Skin Color': ['light', 'yellow', 'pale', 'brown', 'dark', 'black'],
    'Top': ['hat', 'hijab', 'turban', 'winterHat', 'longHair', 'shortHair', 'eyepatch', 'none'],
    'Clothes Type': ['blazer', 'sweater', 'hoodie', 'overall', 'blazerAndShirt', 'collarAndSweater']
  },
  'bottts': {
    'Colors': ['amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'rose', 'violet', 'yellow'],
    'Colorful': ['true', 'false'],
    'Texture': ['circuits', 'dots', 'stripes', 'none']
  },
  'personas': {
    'Background Color': ['amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'rose', 'violet', 'yellow'],
    'Clothes Color': ['black', 'blue', 'green', 'red', 'white'],
    'Skin Color': ['ecru', 'brown', 'black', 'yellow', 'peach'],
    'Hair': ['fonze', 'full', 'pixie', 'caesar', 'clean', 'bald'],
    'Hair Color': ['auburn', 'black', 'blonde', 'brown', 'platinum', 'gray', 'red'],
    'Clothing': ['blazer', 'hoodie', 'shirt', 'dress', 'turtleneck'],
    'Accessory': ['glasses', 'necklace', 'earrings', 'none'],
    'Eyes': ['narrow', 'round', 'smiling', 'sunglasses'],
    'Mouth': ['smile', 'grin', 'openSmile', 'serious', 'neutral']
  },
  'pixel-art': {
    'Background': ['blue', 'purple', 'green', 'yellow', 'red', 'gradient', 'none'],
    'Beard': ['full', 'goatee', 'none'],
    'Clothing': ['crew', 'collared', 'vneck', 'none'],
    'Eyes': ['round', 'squint', 'closed', 'sleepy'],
    'Hair': ['crew', 'long', 'bob', 'mohawk', 'buzzcut', 'bald']
  },
  'lorelei': {
    'Background': ['solid', 'gradient', 'none'],
    'Clothing': ['dress', 'tshirt', 'suit'],
    'Eyes': ['big', 'round', 'smiling', 'closed', 'heart'],
    'Hair': ['long', 'bun', 'pixie', 'bald'],
    'Hair Accessory': ['flowers', 'bow', 'none'],
    'Mouth': ['laughing', 'smile', 'frown', 'expressionless']
  },
  'adventurer': {
    'Background': ['blue', 'purple', 'green', 'yellow', 'red', 'none'],
    'Body': ['default', 'slim', 'athletic'],
    'Clothing': ['robe', 'tunic', 'shirt', 'dress'],
    'Hair': ['long', 'short', 'mohawk', 'bald'],
    'Mouth': ['smile', 'serious', 'surprised'],
    'Skin Color': ['light', 'fair', 'tan', 'dark', 'brown']
  },
};

interface AvatarMakerProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => Promise<void>;
}

const AvatarMaker: React.FC<AvatarMakerProps> = ({ user, onUpdate }) => {
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0].id);
  const [seed, setSeed] = useState(user.id || 'avatar');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generateRandomAvatar = () => {
    setSeed(Math.random().toString(36).substring(2, 10));
    setSelectedOptions({});
  };

  const updateOption = (category: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [category.toLowerCase().replace(/\s+/g, '')]: value }));
  };

  const buildAvatarUrl = () => {
    let url = `${AVATAR_BASE_URL}/${selectedStyle}/svg?seed=${seed}`;
    
    Object.entries(selectedOptions).forEach(([key, value]) => {
      if (value !== 'none' && value !== '') {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    return url;
  };

  const saveAvatar = async () => {
    const avatarUrl = buildAvatarUrl();
    
    try {
      const updatedUser = { ...user, avatar: avatarUrl };
      await onUpdate(updatedUser);
      
      toast({
        title: 'Success',
        description: 'Avatar saved successfully',
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: 'Error',
        description: 'Could not save avatar',
        variant: 'destructive',
      });
    }
  };

  const getIconForCategory = (category: string) => {
    switch(category.toLowerCase()) {
      case 'accessories': return <Glasses className="h-4 w-4" />;
      case 'hair': case 'hair color': return <Crown className="h-4 w-4" />;
      case 'facial hair': case 'beard': return <VenetianMask className="h-4 w-4" />;
      case 'clothes type': case 'clothing': return <Shirt className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  const renderCustomizationOption = (category: string, options: string[]) => {
    return (
      <div key={category} className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {getIconForCategory(category)}
          <span className="font-medium">{category}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {options.map((option) => (
            <Button
              key={option}
              variant={selectedOptions[category.toLowerCase().replace(/\s+/g, '')] === option ? "default" : "outline"}
              size="sm"
              className="text-xs h-auto py-1.5"
              onClick={() => updateOption(category, option)}
            >
              {option === 'none' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative w-32 h-32 sm:w-48 sm:h-48">
          <img 
            src={buildAvatarUrl()} 
            alt="Avatar Preview" 
            className="w-full h-full border-4 border-background rounded-full shadow-lg"
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-medium">Avatar Maker</h3>
          <p className="text-sm text-muted-foreground">
            Create your custom avatar by selecting a style and choosing different options
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRandomAvatar}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Random Avatar
            </Button>
            
            <Button 
              size="sm"
              onClick={saveAvatar}
            >
              Save Avatar
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue={selectedStyle} onValueChange={setSelectedStyle}>
        <TabsList className="mb-4 flex overflow-x-auto">
          {AVATAR_STYLES.map(style => (
            <TabsTrigger 
              key={style.id} 
              value={style.id}
              className="flex items-center gap-1"
              onClick={() => setSelectedOptions({})}
            >
              {style.icon}
              <span className="ml-1">{style.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {AVATAR_STYLES.map(style => (
          <TabsContent key={style.id} value={style.id} className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4 space-y-4">
              {Object.entries(AVATAR_OPTIONS[style.id] || {}).map(([category, options]) => 
                renderCustomizationOption(category, options)
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AvatarMaker;
