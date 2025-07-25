
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Music } from 'lucide-react';
import ChordMiniature from './ChordMiniature';

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

interface ChordListProps {
  chords: Chord[];
  onDeleteChord: (id: string) => void;
  onLoadChord: (chord: Chord) => void;
}

const ChordList: React.FC<ChordListProps> = ({ chords, onDeleteChord, onLoadChord }) => {
  if (chords.length === 0) {
    return (
      <div className="text-center py-6">
        <Music className="mx-auto h-8 w-8 text-gray-500 mb-2" />
        <p className="text-gray-500 text-sm">no hay acordes guardados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 mb-3">acordes guardados</h3>
      {chords.map(chord => (
        <div 
          key={chord.id} 
          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <ChordMiniature chord={chord} size="small" />
            <div>
              <h4 className="font-medium text-white">{chord.name}</h4>
              <p className="text-xs text-gray-400">
                {chord.positions.length} {chord.positions.length === 1 ? 'posición' : 'posiciones'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => onLoadChord(chord)}
              size="sm"
              className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1 h-7"
            >
              <Edit className="h-3 w-3 mr-1" />
              cargar
            </Button>
            <Button
              onClick={() => onDeleteChord(chord.id)}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 h-7"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChordList;
