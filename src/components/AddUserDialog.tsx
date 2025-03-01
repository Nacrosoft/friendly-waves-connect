
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllUsers } from '@/utils/database';
import { User } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (userId: string) => void;
}

export function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const users = await getAllUsers();
      // Filter users by name containing the search term
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(username.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Could not search for users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = (userId: string) => {
    onAddUser(userId);
    onOpenChange(false);
    setUsername('');
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Conversation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="username"
                placeholder="Search by username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
              />
              <Button onClick={handleSearch} disabled={isLoading} type="button" variant="secondary">
                Search
              </Button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleAddUser(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </div>
                  <Button size="sm" variant="ghost">Add</Button>
                </div>
              ))}
            </div>
          )}
          
          {username && searchResults.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-2">
              No users found matching "{username}"
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
