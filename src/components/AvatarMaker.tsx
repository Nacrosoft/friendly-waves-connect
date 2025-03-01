import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  UserRound, 
  Smile, 
  Palette, 
  Glasses, 
  Shirt, 
  RefreshCw 
} from 'lucide-react';
import { User as UserType } from '@/types/chat';
import { saveUser } from '@/utils/database';
import { useToast } from '@/hooks/use-toast';

const AVATAR_BASE_URL = 'https://api.dicebear.com/7.x';
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoonish', icon: <Smile className="h-4 w-4" /> },
  { id: 'bottts', name: 'Robots', icon: <User className="h-4 w-4" /> },
  { id: 'personas', name: 'Personas', icon: <UserRound className="h-4 w-4" /> },
  { id: 'pixel-art', name: 'Pixel Art', icon: <Palette className="h-4 w-4" /> },
  { id: 'lorelei', name: 'Lorelei', icon: <Glasses className="h-4 w-4" /> },
  { id: 'adventurer', name: 'Adventurer', icon: <Shirt className="h-4 w-4" /> },
];

const AVATAR_OPTIONS: Record<string, string[]> = {
  'avataaars': ['accessories', 'beard', 'clothesColor', 'facialHair', 'hairColor', 'skinColor', 'top', 'clothesType'],
  'bottts': ['colors', 'colorful', 'primaryColorLevel', 'secondaryColorLevel', 'texture'],
  'personas': ['backgroundColor', 'clothesColor', 'skinColor', 'hair', 'hairColor', 'clothing', 'accessory', 'eyes', 'mouth'],
  'pixel-art': ['background', 'beard', 'clothing', 'earrings', 'eyes', 'hair', 'mouth'],
  'lorelei': ['background', 'beard', 'clothing', 'eyes', 'freckles', 'hair', 'hairAccessory', 'mouth'],
  'adventurer': ['background', 'body', 'clothing', 'earrings', 'eyebrows', 'eyes', 'hair', 'mouth', 'skinColor'],
};

interface AvatarMakerProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => Promise<void>;
}

const AvatarMaker: React.FC<AvatarMakerProps> = ({ user, onUpdate }) => {
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0].id);
  const [seed, setSeed] = useState(user.id || 'avatar');
  const [options, setOptions] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const generateRandomOptions = () => {
    const newOptions: Record<string, any> = {};
    setSeed(Math.random().toString(36).substring(2, 10));
    setOptions(newOptions);
  };

  const updateOption = (option: string, value: any) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  const buildAvatarUrl = () => {
    let url = `${AVATAR_BASE_URL}/${selectedStyle}/svg?seed=${seed}`;
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        url += `&${key}=${encodeURIComponent(value.toString())}`;
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

  const renderOptionControl = (option: string) => {
    return (
      <div key={option} className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">{option.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
        </div>
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          onValueChange={(values) => updateOption(option, values[0])}
        />
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
            Create your custom avatar by selecting a style and customizing features
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRandomOptions}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Randomize
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
            >
              {style.icon}
              <span className="ml-1">{style.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {AVATAR_STYLES.map(style => (
          <TabsContent key={style.id} value={style.id} className="space-y-4">
            {AVATAR_OPTIONS[style.id]?.map(option => renderOptionControl(option))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AvatarMaker;
