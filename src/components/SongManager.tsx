
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  chords: any[];
}

interface SongManagerProps {
  songs: Song[];
  currentSong: Song | null;
  newSongTitle: string;
  setNewSongTitle: (title: string) => void;
  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: Song | null) => void;
}

const SongManager: React.FC<SongManagerProps> = ({
  songs,
  currentSong,
  newSongTitle,
  setNewSongTitle,
  setSongs,
  setCurrentSong
}) => {
  const createNewSong = () => {
    if (!newSongTitle.trim()) {
      toast.error('ingresa un título');
      return;
    }

    const newSong: Song = {
      id: Date.now().toString(),
      title: newSongTitle.trim(),
      chords: []
    };

    setSongs([...songs, newSong]);
    setCurrentSong(newSong);
    setNewSongTitle('');
    toast.success(`"${newSong.title}" creada`);
  };

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Input
            value={newSongTitle}
            onChange={(e) => setNewSongTitle(e.target.value)}
            placeholder="nueva canción..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button 
            onClick={createNewSong} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {songs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {songs.map(song => (
              <Button
                key={song.id}
                onClick={() => setCurrentSong(song)}
                size="sm"
                className={`text-xs ${
                  currentSong?.id === song.id 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {song.title} ({song.chords.length})
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SongManager;
