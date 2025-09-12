import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import ChordBuilder from '@/components/ChordBuilder';
import ChordList from '@/components/ChordList';
import { recognizeChord } from '@/utils/chordRecognition';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { FingerPosition, Chord, Song } from '../types';

const db = getFirestore(app);

interface SongEditorProps {
  songs: Song[];
  setSongs: Dispatch<SetStateAction<Song[]>>;
}

const SongEditor: React.FC<SongEditorProps> = ({ songs, setSongs }) => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEditingPositions, setCurrentEditingPositions] = useState<FingerPosition[]>([]);
  const [currentEditingFretOffset, setCurrentEditingFretOffset] = useState<number>(0);
  const [currentEditingChordName, setCurrentEditingChordName] = useState<string>('');

  useEffect(() => {
    const fetchSong = async () => {
      if (!songId) {
        setError('ID de canción no proporcionado.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const songRef = doc(db, 'songs', songId);
        const docSnap = await getDoc(songRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const parsedSong: Song = {
            id: docSnap.id,
            title: data.title as string,
            chords: typeof data.chords === 'string' ? JSON.parse(data.chords) : data.chords || []
          };
          setSong(parsedSong);
          console.log('Canción cargada de Firestore en SongEditor:', parsedSong);
        } else {
          setError('Canción no encontrada.');
          setSong(null);
          console.log('Canción no encontrada en Firestore con ID:', songId);
        }
      } catch (err: any) {
        console.error('Excepción al cargar la canción desde Firestore:', err);
        setError(`Error inesperado al cargar la canción: ${err.message || 'Desconocido'}`);
        setSong(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [songId]);

  useEffect(() => {
    if (currentEditingPositions.length > 0) {
      const recognized = recognizeChord(currentEditingPositions, currentEditingFretOffset);
      setCurrentEditingChordName(recognized);
    } else {
      setCurrentEditingChordName('');
    }
  }, [currentEditingPositions, currentEditingFretOffset]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (song) {
      setSong({ ...song, title: e.target.value });
    }
  };

  const handleDeleteChordFromSong = useCallback(async (chordId: string) => {
    if (song) {
      const updatedChords = song.chords.filter(chord => chord.id !== chordId);
      const updatedSong = { ...song, chords: updatedChords };
      setSong(updatedSong);
      setSongs(prevSongs => prevSongs.map(s => s.id === updatedSong.id ? updatedSong : s));
      toast.info('Acorde eliminado');
    }
  }, [song, setSong, setSongs]);

  const handleLoadChordForEditing = useCallback((chordToLoad: Chord) => {
    console.log('Cargando acorde para edición:', chordToLoad.name);
    toast.info(`Acorde "${chordToLoad.name}" cargado para edición.`);
    setCurrentEditingPositions(chordToLoad.positions);
    setCurrentEditingFretOffset(chordToLoad.fretOffset);
    setCurrentEditingChordName(chordToLoad.name);
  }, []);

  const handleSaveSong = useCallback(async () => {
    if (!song) return;
    try {
      const songRef = doc(db, 'songs', song.id);
      const songToSave = {
        ...song,
        chords: JSON.stringify(song.chords)
      };
      await setDoc(songRef, songToSave, { merge: true });
      setSongs(prevSongs => prevSongs.map(s => s.id === song.id ? song : s));
      toast.success('Canción guardada');
      console.log('Canción guardada en Firestore:', song);
    } catch (e: any) {
      console.error('Error al guardar canción en Firestore:', e);
      toast.error(`Error al guardar: ${e.message || 'Desconocido'}`);
    }
  }, [song, setSongs]);

  const handleDeleteSong = useCallback(async () => {
    if (song && window.confirm(`¿Estás seguro de que quieres eliminar "${song.title}"?`)) {
      try {
        const songRef = doc(db, 'songs', song.id);
        await deleteDoc(songRef);
        setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));
        setSong(null);
        toast.success(`"${song.title}" eliminada`);
        navigate('/');
      } catch (err: any) {
        console.error('Excepción al eliminar la canción de Firestore:', err);
        toast.error(`Error inesperado al eliminar la canción: ${err.message || 'Desconocido'}`);
      }
    }
  }, [song, setSongs, navigate, setSong]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando canción...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <Card className="p-4 bg-gray-800 border-gray-700">
          <p className="text-red-500 text-center">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <Card className="p-4 bg-gray-800 border-gray-700">
          <p className="text-yellow-500 text-center">Canción no encontrada.</p>
          <Button onClick={() => navigate('/')} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header y acciones */}
        <div className="flex items-center justify-between py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Input
            value={song.title}
            onChange={handleTitleChange}
            className="flex-grow mx-3 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-center text-lg font-semibold h-11"
          />
          <Button
            onClick={handleSaveSong}
            className="bg-green-600 hover:bg-green-700 text-white h-11"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
        {/* Sección de Acordes */}
        <Card className="p-3 bg-gray-800 border-gray-700">
          <ChordList
            chords={song.chords}
            onDeleteChord={handleDeleteChordFromSong}
            onLoadChord={handleLoadChordForEditing}
          />
          <div className="mt-3">
            <ChordBuilder
              currentSong={song}
              songs={songs}
              setSongs={setSongs}
              setSong={setSong}
              currentPositions={currentEditingPositions}
              setPositions={setCurrentEditingPositions}
              fretOffset={currentEditingFretOffset}
              setFretOffset={setCurrentEditingFretOffset}
              recognizedChordName={currentEditingChordName}
            />
          </div>
        </Card>
        {/* Botón de eliminar canción */}
        <Button
          onClick={handleDeleteSong}
          className="w-full bg-red-600 hover:bg-red-700 text-white h-11 mt-2"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          eliminar canción
        </Button>
      </div>
    </div>
  );
};

export default SongEditor;
