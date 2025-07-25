
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Music, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FingerPosition {
  string: number;
  fret: number;
  finger: number;
}

interface Chord {
  id: string;
  name: string;
  positions: FingerPosition[];
}

interface Song {
  id: string;
  title: string;
  chords: Chord[];
}

interface IndexProps {
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
}

const Index: React.FC<IndexProps> = ({ songs, setSongs, currentSong, setCurrentSong }) => {
  const [newSongTitle, setNewSongTitle] = useState('');
  const navigate = useNavigate();

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

    console.log('Creando nueva canción:', newSong);
    
    const updatedSongs = [...songs, newSong];
    setSongs(updatedSongs);
    setCurrentSong(newSong);
    setNewSongTitle('');
    toast.success(`"${newSong.title}" creada`);
    
    console.log('Navegando a:', `/song/${newSong.id}`);
    navigate(`/song/${newSong.id}`);
  };

  const handleSongSelect = (song: Song) => {
    console.log('Seleccionando canción:', song);
    setCurrentSong(song);
    navigate(`/song/${song.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold mb-2">fretboard</h1>
          <p className="text-gray-400 text-sm">crea y organiza tus acordes</p>
        </div>

        {/* Create New Song */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-center">nueva canción</h2>
          <div className="space-y-3">
            <Input
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              placeholder="nombre de la canción..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-11"
              onKeyPress={(e) => e.key === 'Enter' && createNewSong()}
            />
            <Button 
              onClick={createNewSong} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
              disabled={!newSongTitle.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              crear canción
            </Button>
          </div>
        </Card>

        {/* My Songs Section */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">mis canciones</h2>
            <span className="text-sm text-gray-400">
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
            </span>
          </div>

          {songs.length === 0 ? (
            <div className="text-center py-6">
              <Music className="mx-auto h-8 w-8 text-gray-500 mb-2" />
              <p className="text-gray-500 text-sm">no hay canciones guardadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.slice(0, 3).map(song => (
                <div 
                  key={song.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650 transition-colors"
                  onClick={() => handleSongSelect(song)}
                >
                  <div>
                    <p className="font-medium text-white">{song.title}</p>
                    <p className="text-xs text-gray-400">
                      {song.chords.length} {song.chords.length === 1 ? 'acorde' : 'acordes'}
                    </p>
                  </div>
                  <Music className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              
              {songs.length > 3 && (
                <Button
                  onClick={() => navigate('/songs')}
                  variant="outline"
                  className="w-full mt-3 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 h-10"
                >
                  <List className="h-4 w-4 mr-2" />
                  ver todas las canciones
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
