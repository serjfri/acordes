
import React from 'react';

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

interface ChordMiniatureProps {
  chord: Chord;
  size?: 'small' | 'medium';
}

const ChordMiniature: React.FC<ChordMiniatureProps> = ({ chord, size = 'small' }) => {
  const isSmall = size === 'small';
  const containerWidth = isSmall ? 'w-16' : 'w-20';
  const containerHeight = isSmall ? 'h-20' : 'h-24';
  const dotSize = isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3';
  
  // Calcular el rango de trastes a mostrar
  const minFret = chord.positions.length > 0 
    ? Math.min(...chord.positions.map(p => p.fret))
    : 0;
  
  const startFret = minFret === 0 ? 0 : Math.max(0, minFret - 1);
  const displayFrets = Array.from({ length: 4 }, (_, i) => startFret + i);

  const getFingerAtPosition = (string: number, fret: number) => {
    const position = chord.positions.find(pos => pos.string === string && pos.fret === fret);
    return position?.finger || null;
  };

  const fingerColors = {
    1: 'bg-blue-500',
    2: 'bg-green-500', 
    3: 'bg-yellow-500',
    4: 'bg-red-500'
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Diagrama del acorde */}
      <div className={`${containerWidth} ${containerHeight} bg-gradient-to-b from-amber-50 to-amber-100 rounded border border-amber-300 p-1.5 relative`}>
        {/* Cejilla para acordes abiertos */}
        {startFret === 0 && (
          <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 bg-gray-800 rounded-sm" />
        )}
        
        {/* Indicador de traste inicial */}
        {startFret > 0 && (
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-600">
            {startFret}
          </div>
        )}
        
        {/* Cuerdas y posiciones */}
        <div className="space-y-1.5 pt-0.5">
          {Array.from({ length: 6 }, (_, stringIndex) => (
            <div key={stringIndex} className="relative flex items-center h-1.5">
              {/* Línea de la cuerda */}
              <div className="absolute w-full bg-gray-600 rounded-full h-0.5" />
              
              {/* Posiciones de los trastes */}
              <div className="flex justify-between w-full px-1">
                {displayFrets.map((fret, fretIndex) => {
                  const finger = getFingerAtPosition(stringIndex, fret);
                  return (
                    <div key={fret} className="flex justify-center" style={{ width: '20%' }}>
                      {finger && (
                        <div
                          className={`
                            ${dotSize} rounded-full flex items-center justify-center
                            ${fingerColors[finger as keyof typeof fingerColors]}
                            border border-white/50 text-xs text-white font-bold z-10
                          `}
                        >
                          {!isSmall && finger}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Líneas de los trastes */}
        <div className="absolute inset-0 pointer-events-none px-1.5">
          {displayFrets.slice(1).map((fret, index) => (
            <div 
              key={fret}
              className="absolute top-1.5 bottom-1.5 w-0.5 bg-gray-400/60"
              style={{ left: `${20 + ((index + 1) * 60) / 4}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Nombre del acorde */}
      <div className={`text-center font-medium text-white ${isSmall ? 'text-xs' : 'text-sm'}`}>
        {chord.name}
      </div>
    </div>
  );
};

export default ChordMiniature;
