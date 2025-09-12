
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import ChordMiniature from '@/components/ChordMiniature';

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

interface SongDetailProps {
  songs: Song[];
  setCurrentSong: (song: Song) => void;
}

const SongDetail: React.FC<SongDetailProps> = ({ songs, setCurrentSong }) => {
  const { songId } = useParams();
  const navigate = useNavigate();
  
  const song = songs.find(s => s.id === songId);

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">canción no encontrada</p>
          <Button onClick={() => navigate('/songs')} className="bg-blue-600 hover:bg-blue-700">
            volver a canciones
          </Button>
        </div>
      </div>
    );
  }

  const handleEditSong = () => {
    setCurrentSong(song);
    navigate(`/song/${song.id}`);
  };

  const getNoteAtPosition = (stringIndex: number, fret: number) => {
    const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
    const noteSequence = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const openNote = stringNotes[5 - stringIndex];
    const openNoteIndex = noteSequence.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return noteSequence[noteIndex];
  };

  const getChordNotes = (chord: Chord) => {
    return chord.positions.map(pos => ({
      note: getNoteAtPosition(pos.string, pos.fret),
      string: pos.string + 1,
      fret: pos.fret
    })).sort((a, b) => a.string - b.string);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/songs')}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-10 h-10 p-0 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 pb-20 pt-16">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{song.title}</h1>
          <Button
            onClick={handleEditSong}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            editar
          </Button>
        </div>

        <p className="text-gray-400 text-center">
          {song.chords.length} {song.chords.length === 1 ? 'acorde' : 'acordes'}
        </p>
        
        {song.chords.length === 0 ? (
          <Card className="p-8 text-center bg-gray-800 border-gray-700">
            <p className="text-gray-400">esta canción no tiene acordes</p>
            <Button 
              onClick={handleEditSong}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              agregar acordes
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {song.chords.map(chord => (
              <Card key={chord.id} className="p-4 bg-gray-800 border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <ChordMiniature chord={chord} size="medium" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{chord.name}</h3>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">notas del acorde:</p>
                      <div className="flex flex-wrap gap-2">
                        {getChordNotes(chord).map((noteInfo, index) => (
                          <div key={index} className="bg-gray-700 px-2 py-1 rounded text-xs text-white">
                            <span className="font-bold text-blue-300">{noteInfo.note}</span>
                            <span className="text-gray-400 ml-1">
                              (cuerda {noteInfo.string}, traste {noteInfo.fret})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongDetail;
