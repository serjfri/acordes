import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Mantener si necesitas botones para otras cosas
// Eliminar Input y Label ya que se eliminan los campos de texto
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react'; // Quitar ChevronUp, ChevronDown si no se usan más
import { toast } from 'sonner';
import GuitarNeck from './GuitarNeck'; // Asegúrate de que esta ruta sea correcta
import { recognizeChord } from '@/utils/chordRecognition'; // Asegúrate de que esta ruta sea correcta

interface FingerPosition {
  string: number;
  fret: number;
  finger: number;
}

interface Chord {
  id: string;
  name: string;
  positions: FingerPosition[];
  fretOffset: number; // Añadir fretOffset para guardar correctamente la posición del mástil
}

interface Song {
  id: string;
  title: string;
  chords: Chord[];
}

interface ChordBuilderProps {
  currentSong: Song | null;
  // Ya no necesitamos chordName, setChordName, startFret, setStartFret directamente aquí
  // Estos estados serán gestionados internamente por GuitarNeck y reportados a ChordBuilder
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: Song) => void;
}

const ChordBuilder: React.FC<ChordBuilderProps> = ({
  currentSong,
  songs,
  setSongs,
  setCurrentSong
}) => {
  // Estado para las posiciones y el offset del mástil, que serán pasados a GuitarNeck
  const [currentPositions, setCurrentPositions] = useState<FingerPosition[]>([]);
  const [fretOffset, setFretOffset] = useState(0); // Ahora es fretOffset
  const [recognizedChordName, setRecognizedChordName] = useState(''); // Estado para el nombre reconocido

  // Actualizar el nombre del acorde reconocido cuando cambian las posiciones o el offset
  useEffect(() => {
    if (currentPositions.length > 0) {
      const recognized = recognizeChord(currentPositions, fretOffset);
      setRecognizedChordName(recognized);
    } else {
      setRecognizedChordName('');
    }
  }, [currentPositions, fretOffset]);

  // Función para guardar el acorde en la canción actual
  const saveChordToSong = () => {
    console.log('=== intentando guardar acorde en canción ===');
    console.log('canción actual existe:', !!currentSong);
    console.log('nombre del acorde reconocido:', recognizedChordName);
    console.log('posiciones actuales largo:', currentPositions.length);

    if (!currentSong) {
      console.log('error: no hay canción actual');
      toast.error('primero selecciona o crea una canción');
      return;
    }

    if (!recognizedChordName || recognizedChordName === 'acorde desconocido' || recognizedChordName === 'múltiples notas' || recognizedChordName === 'ningún acorde' || recognizedChordName.length === 0) {
      console.log('error: nombre de acorde no válido o no reconocido');
      toast.error('toca un acorde válido para guardar');
      return;
    }

    if (currentPositions.length === 0) {
      console.log('error: no hay posiciones');
      toast.error('agrega al menos una posición al acorde');
      return;
    }

    try {
      const newChord: Chord = {
        id: Date.now().toString(),
        name: recognizedChordName, // Usamos el nombre reconocido
        positions: [...currentPositions],
        fretOffset: fretOffset // Guardamos el offset del traste
      };

      console.log('nuevo acorde creado:', newChord);

      const updatedSong = {
        ...currentSong,
        chords: [...currentSong.chords, newChord]
      };

      console.log('canción actualizada con nuevo acorde:', updatedSong);

      const updatedSongs = songs.map(song =>
        song.id === currentSong.id ? updatedSong : song
      );

      console.log('array de canciones actualizado:', updatedSongs);

      setSongs(updatedSongs);
      setCurrentSong(updatedSong);

      // Limpiar el mástil después de guardar
      setCurrentPositions([]);
      setFretOffset(0);
      setRecognizedChordName('');

      console.log('=== acorde guardado exitosamente ===');
      toast.success(`acorde "${newChord.name.toLowerCase()}" guardado correctamente`);
    } catch (error) {
      console.error('error al guardar acorde:', error);
      toast.error('error al guardar el acorde');
    }
  };

  if (!currentSong) return null;

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <div className="space-y-4">
        {/* Aquí ya NO están las secciones de "nombre del acorde" y "traste inicial" */}

        {/* GuitarNeck ahora es el responsable de toda la interacción y visualización */}
        <div>
          <GuitarNeck
            positions={currentPositions}
            setPositions={setCurrentPositions} // Pasar la función para que GuitarNeck actualice las posiciones
            fretOffset={fretOffset}
            setFretOffset={setFretOffset} // Pasar la función para que GuitarNeck actualice el offset
            recognizedChordName={recognizedChordName} // Pasar el nombre reconocido a GuitarNeck para mostrarlo
            // Ya no necesitas onChordChange porque setPositions ya hace la actualización
            // Y GuitarNeck ya no tendrá un botón de guardar interno, lo hará ChordBuilder
          />
        </div>

        {/* Botón de Guardar Acorde (consolidado aquí en ChordBuilder) */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={saveChordToSong}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 h-10 lowercase"
            // Deshabilitar si no hay un nombre reconocido válido o posiciones
            disabled={!recognizedChordName || recognizedChordName === 'acorde desconocido' || recognizedChordName === 'múltiples notas' || recognizedChordName === 'ningún acorde' || currentPositions.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            guardar acorde
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChordBuilder;