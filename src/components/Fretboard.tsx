import React from "react";

interface FretboardProps {
  startFret?: number;
  numFrets?: number;
  getFingerAtPosition?: (stringIndex: number, fret: number) => number | null;
  dotSize?: string;
  isSmall?: boolean;
}

const Fretboard: React.FC<FretboardProps> = ({
  startFret = 0,
  numFrets = 4,
  getFingerAtPosition = () => null,
  dotSize = "w-5",
  isSmall = false,
}) => {
  const displayFrets = Array.from({ length: numFrets }, (_, i) => i + startFret + 1);
  const fretWidth = `${100 / numFrets}%`;
  const fingerColors: Record<string, string> = {
    1: "bg-red-500",
    2: "bg-blue-500",
    3: "bg-green-500",
    4: "bg-yellow-500",
  };

  const safeGetFingerAtPosition = React.useCallback(
    (stringIndex: number, fret: number) => {
      if (typeof getFingerAtPosition === 'function') {
        return getFingerAtPosition(stringIndex, fret);
      }
      return null;
    },
    [getFingerAtPosition]
  );

  // Tamaño compacto pero proporcional
  const containerWidth = isSmall ? `${numFrets * 18}px` : `${numFrets * 22}px`;
  const containerHeight = isSmall ? "70px" : "85px";

  return (
    <div
      className={`relative bg-amber-100 rounded-md border border-gray-400 overflow-hidden`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Cuerdas */}
      <div className="absolute inset-0 px-1 flex flex-col justify-between py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[1px] bg-gray-800 w-full" />
        ))}
      </div>

      {/* Trastes */}
      <div className="absolute inset-0 flex">
        {displayFrets.map((_, i) => (
          <div
            key={i}
            className="border-r border-gray-700 relative"
            style={{ width: fretWidth }}
          />
        ))}
      </div>

      {/* Cejuela */}
      {startFret === 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 rounded-sm shadow-sm" />
      )}

      {/* Dedos (tamaño proporcional) */}
      <div className="absolute inset-0 px-1">
        {Array.from({ length: 6 }, (_, stringIndex) =>
          displayFrets.map((fret, i) => {
            const finger = safeGetFingerAtPosition(stringIndex, fret);
            if (!finger) return null;
            const left = (i + 0.5) * (100 / numFrets);
            const top = ((stringIndex / 5) * 100 * 0.8) + 8; // Ajuste para evitar superposición
            return (
              <div
                key={`${stringIndex}-${fret}`}
                className="absolute"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`${isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} aspect-square rounded-full flex items-center justify-center ${
                    fingerColors[finger as keyof typeof fingerColors]
                  } border border-white shadow-sm ${isSmall ? 'text-[7px]' : 'text-[8px]'} text-white font-bold`}
                >
                  {!isSmall && finger}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Fretboard;
