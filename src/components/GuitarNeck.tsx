import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// === IMPORTACIÓN DE TIPOS CENTRALIZADOS ===
import { FingerPosition } from '../types'; 
// === FIN IMPORTACIÓN DE TIPOS ===

// === IMPORTACIÓN DE FUNCIONES DE UTILIDAD ===
import { noteNameToIndex } from '../utils/chordRecognition'; 
// === FIN IMPORTACIÓN DE FUNCIONES DE UTILIDAD ===

export interface GuitarNeckProps {
  positions: FingerPosition[]; // Usamos FingerPosition directamente
  fretOffset: number;
  onToggleNote: (stringIndex: number, fretIndex: number, finger?: number) => void;
}

const numStrings = 6;
const numFrets = 5; 

const stringTuning = ['E', 'B', 'G', 'D', 'A', 'E']; 
const chromaticScale = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// Colores para cada dedo
const fingerColors = {
  1: 'bg-yellow-500 border-yellow-400', // Índice
  2: 'bg-green-500 border-green-400',   // Medio  
  3: 'bg-blue-500 border-blue-400',     // Anular
  4: 'bg-red-500 border-red-400',       // Meñique
  default: 'bg-gray-500 border-gray-400' // Sin dedo asignado
};

// Función auxiliar para formatear la nota individual
const formatIndividualNoteName = (note: string): string => {
    if (!note) return '';
    const root = note.charAt(0).toUpperCase(); 
    let accidental = note.slice(1); 
    accidental = accidental.replace('b', '♭').replace('#', '♯'); 
    return root + accidental;
};

// Función para formatear el nombre del acorde para la visualización final
export const formatChordForDisplay = (chordName: string): React.ReactNode => {
    if (!chordName || 
        chordName.toLowerCase().includes('toca un acorde') || 
        chordName.toLowerCase().includes('ningún acorde') || 
        chordName.toLowerCase().includes('nota única') || 
        chordName.toLowerCase().includes('acorde desconocido')
    ) {
        return chordName.toLowerCase();
    }

    const parts = chordName.split('/');
    let mainChordPart = parts[0];
    const bassPart = parts[1];

    let formattedMainChord: React.ReactNode[] = [];
    let formattedType = '';

    const match = mainChordPart.match(/^([A-G][#♯b♭]?)(.*)/i);
    if (match) {
        const rootNote = match[1].charAt(0).toUpperCase();
        let accidentalRoot = match[1].slice(1).replace('b', '♭');

        const processedAccidentalRoot = accidentalRoot.includes('#') 
            ? <span className="sharp-symbol">♯</span> 
            : accidentalRoot.includes('♯') 
                ? <span className="sharp-symbol">♯</span> 
                : accidentalRoot;

        formattedMainChord.push(rootNote, processedAccidentalRoot);
        
        let chordTypeSuffix = match[2]; 

        for (const char of chordTypeSuffix) {
            if (/[A-Z]/.test(char)) {
                formattedType += char.toLowerCase();
            } else {
                formattedType += char;
            }
        }
        formattedMainChord.push(formattedType);
    } else {
        formattedMainChord.push(formatIndividualNoteName(mainChordPart));
    }

    let formattedBassPart: React.ReactNode = '';
    if (bassPart) {
        const bassRoot = bassPart.charAt(0).toUpperCase();
        let bassAccidental = bassPart.slice(1).replace('b', '♭');
        
        const processedBassAccidental = bassAccidental.includes('#')
            ? <span className="sharp-symbol">♯</span>
            : bassAccidental.includes('♯')
                ? <span className="sharp-symbol">♯</span>
                : bassAccidental;
        
        formattedBassPart = <>/ {bassRoot}{processedBassAccidental}</>;
    }

    return (
        <>
            {formattedMainChord}
            {formattedBassPart}
        </>
    );
};

const GuitarNeck: React.FC<GuitarNeckProps> = ({
  positions,
  fretOffset,
  onToggleNote,
}) => {
    const [selectedFinger, setSelectedFinger] = useState<number>(1);

    // Función auxiliar para obtener la nota en una posición específica
    const getNoteAtPosition = useCallback((stringIndex: number, fret: number) => {
        const openStringIndex = noteNameToIndex(stringTuning[stringIndex]); 
        if (openStringIndex === -1) {
            console.error(`Nota de cuerda abierta no válida en stringTuning: ${stringTuning[stringIndex]}`);
            return '';
        }
        const noteIndex = (openStringIndex + fret) % 12;
        return formatIndividualNoteName(chromaticScale[noteIndex]);
    }, []);

    const handleNoteToggle = useCallback((stringIndex: number, fretIndex: number) => {
        onToggleNote(stringIndex, fretIndex, selectedFinger);
    }, [selectedFinger, onToggleNote]);

    return (
        <div className="w-full max-w-full">
            {/* Selector de dedos */}
            <div className="mb-4 flex gap-2 justify-center">
                {[1, 2, 3, 4].map((finger) => (
                    <button
                        key={finger}
                        onClick={() => setSelectedFinger(finger)}
                        className={`
                            w-8 h-8 rounded-full border-2 font-bold text-white text-sm
                            transition-all duration-200 hover:scale-110 active:scale-95
                            ${selectedFinger === finger 
                                ? `${fingerColors[finger as keyof typeof fingerColors]} ring-2 ring-gray-400 shadow-md` 
                                : `${fingerColors[finger as keyof typeof fingerColors]} opacity-50 hover:opacity-75`
                            }
                        `}
                    >
                        {finger}
                    </button>
                ))}
            </div>

            {/* Mástil de la guitarra */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {/* Contenedor principal con scroll horizontal */}
                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        {/* Grid principal del mástil */}
                        <div className="relative">
{/* Líneas de trastes (fondo) */}
<div className="absolute inset-0 flex">
  {Array.from({ length: numFrets + 1 }).map((_, i) => {
    const absoluteFret = fretOffset + i;
    const isNutSeparator = absoluteFret === 1; // entre 0 y 1
    const isRootMarker = absoluteFret > 0 && absoluteFret % 12 === 0;

    return (
      <div
        key={i}
        className={`
          flex-1 min-w-[50px] sm:min-w-[60px]
          ${isNutSeparator ? 'border-l-8 border-gray-500' : (i > 0 ? 'border-l-2 border-gray-600' : '')}
          ${isRootMarker && !isNutSeparator ? 'border-l-4 border-yellow-500' : ''}
        `}
      />
    );
  })}

  {/* Línea vertical en el traste 0 (fina como las otras) */}
  <div className="absolute inset-y-0 left-0 border-l-2 border-gray-600"></div>
</div>

{/* Línea superior horizontal */}
<div className="absolute top-0 left-0 right-0 border-t-2 border-gray-600 z-20"></div>



                            {/* Cuerdas y posiciones */}
                            <div className="relative z-10">
                                {Array.from({ length: numStrings }).map((_, stringIndex) => (
                                    <div
                                        key={stringIndex}
                                        className={`
                                            flex h-12 sm:h-14 items-center
                                            ${stringIndex < numStrings - 1 ? 'border-b-2 border-gray-700' : ''}
                                        `}
                                    >
                                        {Array.from({ length: numFrets + 1 }).map((_, fretIndex) => {
                                            const absoluteFret = fretOffset + fretIndex;
                                            const position = positions.find(
                                                (pos) => pos.string === stringIndex && pos.fret === absoluteFret
                                            );
                                            const noteToDisplay = getNoteAtPosition(stringIndex, absoluteFret);
                                            
                                            return (
                                                <div
                                                    key={fretIndex}
                                                    className="flex-1 min-w-[50px] sm:min-w-[60px] h-full flex justify-center items-center cursor-pointer hover:bg-gray-700 hover:bg-opacity-50 transition-colors"
                                                    onClick={() => handleNoteToggle(stringIndex, absoluteFret)}
                                                >
                                                    {position && (
                                                        <div 
                                                            className={`
                                                                w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-lg border-2 
                                                                flex items-center justify-center text-xs font-bold text-white
                                                                ${position.finger ? fingerColors[position.finger as keyof typeof fingerColors] : fingerColors.default}
                                                                hover:scale-110 transition-transform
                                                            `}
                                                        >
                                                            <span className="text-[10px] sm:text-xs leading-none">
                                                                {noteToDisplay}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Números de traste */}
                        <div className="bg-gray-900 border-t-2 border-gray-700">
                            <div className="flex">
                                {Array.from({ length: numFrets + 1 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 min-w-[50px] sm:min-w-[60px] h-8 sm:h-10 flex justify-center items-center"
                                    >
                                        <span className="text-xs sm:text-sm font-bold text-gray-400">
                                            {fretOffset + i}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default GuitarNeck;