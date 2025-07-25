import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChordBuilder from '@/components/ChordBuilder';
import ChordList from '@/components/ChordList';
import { Card } from '@/components/ui/card';

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

interface SongEditorProps {
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ 
  songs, 
  setSongs, 
  currentSong, 
  setCurrentSong 
}) => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [chordName, setChordName] = useState('');
  const [startFret, setStartFret] = useState(0);
  const [currentPositions, setCurrentPositions] = useState<FingerPosition[]>([]);

  useEffect(() => {
    console.log('SongEditor - songId:', songId);
    console.log('SongEditor - songs:', songs);
    console.log('SongEditor - currentSong:', currentSong);
    
    if (songId && songs.length > 0) {
      const song = songs.find(s => s.id === songId);
      console.log('SongEditor - song encontrada:', song);
      if (song) {
        setCurrentSong(song);
      } else {
        console.log('SongEditor - canción no encontrada, navegando al inicio');
        navigate('/');
      }
    } else if (songId && songs.length === 0) {
      console.log('SongEditor - no hay canciones, navegando al inicio');
      navigate('/');
    }
  }, [songId, songs, setCurrentSong, navigate]);

  const deleteChord = (chordId: string) => {
    if (!currentSong) return;

    const updatedSong = {
      ...currentSong,
      chords: currentSong.chords.filter(chord => chord.id !== chordId)
    };

    setSongs(songs.map(song => 
      song.id === currentSong.id ? updatedSong : song
    ));
    setCurrentSong(updatedSong);
  };

  const loadChord = (chord: Chord) => {
    setCurrentPositions(chord.positions);
    setChordName(chord.name);
    // Calcular el fret inicial basado en las posiciones del acorde
    if (chord.positions.length > 0) {
      const minFret = Math.min(...chord.positions.map(pos => pos.fret));
      setStartFret(minFret);
    }
  };

  // Si no hay canción actual y estamos intentando cargar una, mostrar loading
  if (songId && !currentSong) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-3 flex items-center justify-center">
        <p className="text-gray-400">cargando canción...</p>
      </div>
    );
  }

  // Si definitivamente no hay canción, mostrar error
  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">canción no encontrada</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Back Button - moved to LEFT */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/')}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-10 h-10 p-0 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-4 pb-20">
        <h1 className="text-xl font-bold text-center mb-6 pt-4">{currentSong.title}</h1>
        
        {/* Chord Builder */}
        <ChordBuilder
          currentSong={currentSong}
          chordName={chordName}
          setChordName={setChordName}
          startFret={startFret}
          setStartFret={setStartFret}
          currentPositions={currentPositions}
          setCurrentPositions={setCurrentPositions}
          songs={songs}
          setSongs={setSongs}
          setCurrentSong={setCurrentSong}
        />

        {/* Chord List */}
        {currentSong.chords.length > 0 && (
          <Card className="p-4 bg-gray-800 border-gray-700">
            <ChordList
              chords={currentSong.chords}
              onDeleteChord={deleteChord}
              onLoadChord={loadChord}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default SongEditor;
