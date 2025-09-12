import React, { useState, Dispatch, SetStateAction } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Music, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
// === IMPORTACIÓN DE TIPOS Y CONSTANTES ===
import { Song } from '../types';
import { Firestore, collection, setDoc, doc } from 'firebase/firestore';
const SONGS_COLLECTION_NAME = 'songs';
// === FIN IMPORTACIÓN DE TIPOS ===

interface IndexProps {
  songs: Song[];
  setSongs: Dispatch<SetStateAction<Song[]>>;
  db: Firestore;
}

const Index: React.FC<IndexProps> = ({ songs, setSongs, db }) => {
  const [newSongTitle, setNewSongTitle] = useState('');
  const navigate = useNavigate();

  const createNewSong = async () => {
    if (!newSongTitle.trim()) {
      toast.error('ingresa un título');
      return;
    }
    const newSongRef = doc(collection(db, SONGS_COLLECTION_NAME));
    const newSong: Song = {
      id: newSongRef.id,
      title: newSongTitle.trim(),
      chords: [],
    };
    try {
      await setDoc(newSongRef, {
        title: newSong.title,
        chords: JSON.stringify(newSong.chords)
      });
      console.log('Canción guardada en Firestore:', newSong);
      setSongs(prevSongs => [...prevSongs, newSong]);
      setNewSongTitle('');
      toast.success(`"${newSong.title}" creada`);
      navigate(`/song/${newSong.id}`);
    } catch (e: any) {
      console.error("Error al crear la canción: ", e);
      toast.error(`Error al guardar la canción: ${e.message}`);
    }
  };

  const handleSongSelect = (song: Song) => {
    console.log('Seleccionando canción:', song);
    navigate(`/song/${song.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">
      <div className="max-w-md mx-auto space-y-4">
        {/* Create New Song */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-center"></h2>
          <div className="space-y-3">
            <Input
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              placeholder="título"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-11"
              onKeyPress={(e) => e.key === 'Enter' && createNewSong()}
            />
            <Button
              onClick={createNewSong}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
              disabled={!newSongTitle.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
            
            </Button>
          </div>
        </Card>
        {/* My Songs Section */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold"></h2>
            <span className="text-sm text-gray-400">
 
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
                  ver todas
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
