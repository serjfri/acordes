import React from "react";
import Fretboard from "./Fretboard";

interface ChordPosition {
  string: number;
  fret: number;
  finger: number | null;
}

interface ChordMiniatureProps {
  chord: {
    name: string;
    positions: ChordPosition[];
  };
  startFret?: number;
  numFrets?: number;
  isSmall?: boolean;
}

const ChordMiniature: React.FC<ChordMiniatureProps> = ({
  chord,
  startFret = 0,
  numFrets = 4, // Solo 4 trastes visibles
  isSmall = false,
}) => {
  const getFingerAtPosition = React.useCallback(
    (stringIndex: number, fret: number): number | null => {
      const position = chord.positions.find(
        (p) => p.string === stringIndex && p.fret === fret
      );
      return position ? position.finger : null;
    },
    [chord.positions]
  );

  const fretNumbers = React.useMemo(() => {
    const numbers = [];
    for (let i = 0; i < numFrets; i++) {
      numbers.push(startFret + i + 1); // +1 porque los trastes empiezan desde 1
    }
    return numbers;
  }, [startFret, numFrets]);

  const fretWidth = `${100 / numFrets}%`;

  // Tamaño compacto para la miniatura
  const containerWidth = isSmall ? `${numFrets * 18}px` : `${numFrets * 22}px`;

  return (
    <div className="p-1 border rounded-lg shadow-sm bg-white w-fit">
      <h3 className={`text-center font-semibold text-gray-800 mb-1 ${isSmall ? 'text-xs' : 'text-sm'}`}>
        {chord.name}
      </h3>
      <div className="relative flex flex-col items-center">
        <div style={{ width: containerWidth }}>
          <Fretboard
            startFret={startFret}
            numFrets={numFrets}
            getFingerAtPosition={getFingerAtPosition}
            isSmall={isSmall}
          />
        </div>
        {/* Números de traste en la parte inferior */}
        <div
          className="flex justify-start mt-0.5"
          style={{ width: containerWidth }}
        >
          {fretNumbers.map((fretNum, index) => (
            <div
              key={index}
              className="text-gray-600 text-center font-medium"
              style={{
                width: fretWidth,
                fontSize: isSmall ? "9px" : "10px",
                flexShrink: 0,
              }}
            >
              {fretNum}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChordMiniature;
