
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChordMiniature from '@/components/ChordMiniature';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

const SongList: React.FC<SongListProps> = ({ songs, onSelectSong }) => {
  const navigate = useNavigate();
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());

  const handleSongSelect = (song: Song) => {
    onSelectSong(song);
    navigate(`/song/${song.id}`);
  };

  const toggleSongExpansion = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedSongs);
    if (newExpanded.has(songId)) {
      newExpanded.delete(songId);
    } else {
      newExpanded.add(songId);
    }
    setExpandedSongs(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/')}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-10 h-10 p-0 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 pb-20 pt-16">
        <h1 className="text-xl font-bold text-center mb-6">mis canciones</h1>
        
        {songs.length === 0 ? (
          <Card className="p-8 text-center bg-gray-800 border-gray-700">
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400">no hay canciones guardadas</p>
            <p className="text-sm text-gray-500 mt-2">crea tu primera canción</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {songs.map(song => (
              <Card 
                key={song.id}
                className="bg-gray-800 border-gray-700 overflow-hidden"
              >
                <Collapsible>
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => handleSongSelect(song)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-lg">{song.title}</h3>
                        <p className="text-sm text-gray-400">
                          {song.chords.length} {song.chords.length === 1 ? 'acorde' : 'acordes'}
                        </p>
                        {/* Mostrar nombres de acordes siempre */}
                        {song.chords.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {song.chords.map((chord, index) => (
                                <span key={chord.id} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                  {chord.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {song.chords.length > 0 && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white p-1"
                              onClick={(e) => toggleSongExpansion(song.id, e)}
                            >
                              {expandedSongs.has(song.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                        <Music className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  {song.chords.length > 0 && (
                    <CollapsibleContent>
                      <div className="px-4 pb-4 bg-gray-700/50">
                        <div className="border-t border-gray-600 pt-4">
                          <p className="text-xs text-gray-400 mb-3">vista de acordes:</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {song.chords.map(chord => (
                              <ChordMiniature key={chord.id} chord={chord} size="small" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongList;
