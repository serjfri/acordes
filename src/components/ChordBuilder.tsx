import React, { useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Minus, Check, X } from 'lucide-react';
import { recognizeChord } from '@/utils/chordRecognition';
import GuitarNeck from '@/components/GuitarNeck';
import { v4 as uuidv4 } from 'uuid'; 

// === IMPORTACIÓN DE TIPOS CENTRALIZADOS ===
import { FingerPosition, Chord, Song } from '../types';
// === FIN IMPORTACIÓN DE TIPOS ===

// Interfaz actualizada para usar FingerPosition directamente
interface ChordBuilderProps {
  currentSong: Song | null;
  songs: Song[];
  setSongs: Dispatch<SetStateAction<Song[]>>; 
  setSong: Dispatch<SetStateAction<Song | null>>;
  currentPositions: FingerPosition[];
  setPositions: Dispatch<SetStateAction<FingerPosition[]>>;
  fretOffset: number;
  setFretOffset: Dispatch<SetStateAction<number>>;
  recognizedChordName: string;
}

const ChordBuilder: React.FC<ChordBuilderProps> = ({
  currentSong,
  songs,
  setSongs,
  setSong,
  currentPositions,
  setPositions,
  fretOffset,
  setFretOffset,
  recognizedChordName,
}) => {
  // Función mejorada que maneja la selección de dedos
  const onToggleNote = useCallback((stringIndex: number, fret: number, finger?: number) => {
    setPositions(prevPositions => {
      const existingIndex = prevPositions.findIndex(
        pos => pos.string === stringIndex && pos.fret === fret
      );
      
      if (existingIndex !== -1) {
        // Si ya existe, la removemos
        return prevPositions.filter((_, index) => index !== existingIndex);
      } else {
        // Si no existe, la agregamos con el dedo seleccionado
        const newPosition: FingerPosition = { 
          string: stringIndex, 
          fret: fret, 
          finger: finger || 1 // Default al dedo 1 si no se especifica
        };
        return [...prevPositions, newPosition];
      }
    });
  }, [setPositions]);

  const handleAddChord = useCallback(() => {
    if (!currentSong || currentPositions.length === 0) {
      toast.error('No puedes agregar un acorde vacío.');
      return;
    }

    const newChordId = uuidv4();
    const newChord: Chord = {
      id: newChordId,
      name: recognizedChordName,
      positions: currentPositions, // Ahora funciona directamente
      fretOffset: fretOffset,
    };

    const updatedChords = [...currentSong.chords, newChord];
    const updatedSong = { ...currentSong, chords: updatedChords };

    setSong(updatedSong);

    setPositions([]);
    setFretOffset(0);
    toast.success('Acorde agregado. Recuerda guardar la canción.');
  }, [currentSong, currentPositions, recognizedChordName, fretOffset, setSong, setPositions, setFretOffset]);

  const handleClearBuilder = useCallback(() => {
    setPositions([]);
    setFretOffset(0);
    toast.info('Constructor de acordes limpiado.');
  }, [setPositions, setFretOffset]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-4 sm:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-gray-400 font-medium lowercase">constructor de acordes</h3>
        </div>
        
        {/* Nombre del acorde reconocido */}
        <div className="text-center text-3xl sm:text-4xl font-bold mb-6 text-yellow-500">
          {recognizedChordName || 'toca un acorde'}
        </div>
        
        {/* Mástil de guitarra mejorado */}
        <div className="mb-6">
          <GuitarNeck
            positions={currentPositions}
            fretOffset={fretOffset}
            onToggleNote={onToggleNote}
          />
        </div>
        
        {/* Controles de traste - Centrados */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <Button
            onClick={() => setFretOffset(prev => Math.max(0, prev - 1))}
            variant="outline"
            className="w-10 h-10 p-0 hover:bg-gray-700"
            disabled={fretOffset <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="px-4 py-2 bg-gray-700 rounded-lg">
            <span className="text-gray-200 font-medium">Traste: {fretOffset}</span>
          </div>
          
          <Button
            onClick={() => setFretOffset(prev => Math.min(15, prev + 1))} // Límite máximo en traste 15
            variant="outline"
            className="w-10 h-10 p-0 hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Botones principales - Perfectamente centrados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <Button
            onClick={handleAddChord}
            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 transition-colors"
            disabled={currentPositions.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Agregar Acorde
          </Button>
          
          <Button
            onClick={handleClearBuilder}
            className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>

        {/* Información adicional */}
        {currentPositions.length > 0 && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">
              {currentPositions.length} nota{currentPositions.length !== 1 ? 's' : ''} seleccionada{currentPositions.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChordBuilder;