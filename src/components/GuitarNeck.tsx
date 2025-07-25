// src/components/GuitarNeck.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, Eraser } from 'lucide-react';

// Se asume que recognizeChord nos da el nombre con el formato deseado
// o que formatChordForDisplay lo ajusta antes de mostrarlo.

interface FingerPosition {
    string: number;
    fret: number;
    finger: number;
}

// Interfaz de Props para GuitarNeck
interface GuitarNeckProps {
    positions: FingerPosition[];
    setPositions: (positions: FingerPosition[]) => void;
    fretOffset: number;
    setFretOffset: (fret: number) => void;
    recognizedChordName: string; // Recibe el nombre ya reconocido desde el padre
}

// Asegurarse de que las notas de afinación estén en MAYÚSCULAS
const stringTuning = ['E', 'B', 'G', 'D', 'A', 'E']; // En MAYÚSCULAS
// La escala cromática en mayúsculas para cálculos internos consistentes
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Función auxiliar para formatear la nota individual (E, F#, C#b, etc.)
// Esta función es para el *display* de las notas en los círculos de los dedos.
const formatIndividualNoteName = (note: string): string => {
    if (!note) return '';
    const root = note.charAt(0).toUpperCase(); // Nota raíz en mayúscula
    let accidental = note.slice(1); // Resto del string (accidental)

    // Estandarizar accidentales para la visualización
    accidental = accidental.replace('b', '♭').replace('#', '♯'); // Usar símbolos Unicode si se prefiere

    return root + accidental;
};

// Función para formatear el nombre del acorde para la visualización final
// Esta función es vital para asegurar el formato (C, Cm, Cmaj7, C/G)
const formatChordForDisplay = (chordName: string): React.ReactNode => { // CAMBIO: Tipo de retorno a React.ReactNode
    // Si es un mensaje informativo, mantenerlo en minúsculas
    if (!chordName || 
        chordName.toLowerCase().includes('toca un acorde') || 
        chordName.toLowerCase().includes('ningún acorde') || 
        chordName.toLowerCase().includes('nota única') || 
        chordName.toLowerCase().includes('acorde desconocido')
    ) {
        return chordName.toLowerCase();
    }

    // Dividir en parte principal y bajo (si existe)
    const parts = chordName.split('/');
    let mainChordPart = parts[0];
    const bassPart = parts[1];

    let formattedMainChord: React.ReactNode[] = []; // CAMBIO: Array de React.ReactNode
    let formattedType = '';

    // Separar la nota raíz del tipo de acorde
    const match = mainChordPart.match(/^([A-G][#♯b♭]?)(.*)/i);
    if (match) {
        // Asegurar que la nota raíz esté en MAYÚSCULAS y con el accidental estandarizado
        const rootNote = match[1].charAt(0).toUpperCase();
        let accidentalRoot = match[1].slice(1).replace('b', '♭');

        // CAMBIO PRINCIPAL AQUÍ: Envolver el ♯ del acorde principal en un span
        const processedAccidentalRoot = accidentalRoot.includes('#') 
            ? <span className="sharp-symbol">♯</span> 
            : accidentalRoot.includes('♯') 
                ? <span className="sharp-symbol">♯</span> 
                : accidentalRoot;

        formattedMainChord.push(rootNote, processedAccidentalRoot);
        
        let chordTypeSuffix = match[2]; 

        // Asegurar que el sufijo 'm' sea minúscula y otros se mantengan como vienen (que ya deberían ser minúsculas de recognizeChord)
        for (const char of chordTypeSuffix) {
            if (/[A-Z]/.test(char)) {
                formattedType += char.toLowerCase();
            } else {
                formattedType += char;
            }
        }
        formattedMainChord.push(formattedType);
    } else {
        // Fallback: si no coincide con el patrón esperado (solo una nota, o algo raro)
        formattedMainChord.push(formatIndividualNoteName(mainChordPart));
    }

    // Formatear la nota de bajo si existe, también en MAYÚSCULAS con estandarización
    let formattedBassPart: React.ReactNode = '';
    if (bassPart) {
        const bassRoot = bassPart.charAt(0).toUpperCase();
        let bassAccidental = bassPart.slice(1).replace('b', '♭');
        
        // CAMBIO PRINCIPAL AQUÍ: Envolver el ♯ de la nota de bajo en un span
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
    setPositions,
    fretOffset,
    setFretOffset,
    recognizedChordName
}) => {
    const getNoteAtPosition = (stringIndex: number, fret: number) => {
        const openStringNote = stringTuning[stringIndex];
        const openStringIndex = chromaticScale.indexOf(openStringNote);
        if (openStringIndex === -1) {
            console.error(`Nota de cuerda abierta no válida en stringTuning: ${openStringNote}`);
            return ''; // O manejar el error de otra forma
        }
        const noteIndex = (openStringIndex + fret) % 12;
        // Usar formatIndividualNoteName para la visualización
        return formatIndividualNoteName(chromaticScale[noteIndex]);
    };

    const setFingerPosition = (string: number, fret: number) => {
        let newPositions = [...positions];

        if (isDeleteMode) {
            newPositions = newPositions.filter(pos => !(pos.string === string && pos.fret === fret));
        } else {
            const existingPositionOnString = newPositions.findIndex(pos => pos.string === string);

            if (existingPositionOnString !== -1) {
                newPositions[existingPositionOnString] = { string, fret, finger: selectedFinger };
            } else {
                newPositions.push({ string, fret, finger: selectedFinger });
            }
            newPositions.sort((a, b) => a.string - b.string);
        }
        setPositions(newPositions);
    };

    const clearAll = () => {
        setPositions([]);
    };

    const moveFretUp = () => {
        setFretOffset(prev => prev + 1);
        setPositions([]); // Limpiar posiciones al cambiar el traste base
    };

    const moveFretDown = () => {
        setFretOffset(prev => Math.max(0, prev - 1));
        setPositions([]); // Limpiar posiciones al cambiar el traste base
    };

    const undoLast = () => {
        if (positions.length > 0) {
            const newPositions = [...positions];
            newPositions.pop();
            setPositions(newPositions);
        }
    };

    const [selectedFinger, setSelectedFinger] = React.useState(1);
    const [isDeleteMode, setIsDeleteMode] = React.useState(false);


    const getFingerAtPosition = (string: number, fret: number) => {
        const position = positions.find(pos => pos.string === string && pos.fret === fret);
        return position?.finger || null;
    };

    const fingerColors = {
        1: 'bg-cyan-400 border-cyan-500 text-white shadow-lg',
        2: 'bg-green-500 border-green-600 text-white shadow-lg',
        3: 'bg-yellow-500 border-yellow-600 text-black shadow-lg',
        4: 'bg-pink-500 border-pink-600 text-white shadow-lg'
    };

    return (
        <div className="w-full min-h-screen bg-gray-900 p-2 space-y-3">

            {/* Visualización del Nombre del Acorde (usa recognizedChordName de props) */}
            <div className="text-center mb-4">
                <div className="text-2xl md:text-4xl font-bold text-white bg-gray-800 rounded-xl py-3 px-6 inline-block shadow-lg">
                    {formatChordForDisplay(recognizedChordName || "toca un acorde")}
                </div>
            </div>

            {/* Selector de Dedo */}
            <div className="text-center">
                <div className="text-sm font-medium text-gray-300 mb-2 lowercase">
                    {isDeleteMode ? 'modo borrar activo' : 'dedo seleccionado:'}
                </div>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4].map((finger) => (
                        <button
                            key={finger}
                            onClick={() => {
                                setSelectedFinger(finger);
                                setIsDeleteMode(false);
                            }}
                            className={`
                                w-10 h-10 rounded-full border-2 transition-all duration-200
                                hover:scale-110 active:scale-95 flex items-center justify-center
                                text-sm font-bold
                                ${selectedFinger === finger && !isDeleteMode
                                    ? fingerColors[finger as keyof typeof fingerColors] + ' ring-2 ring-white'
                                    : 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-gray-300'
                                }
                            `}
                            disabled={isDeleteMode}
                        >
                            {finger}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controles del mástil */}
            <div className="flex items-center justify-center bg-gray-800 rounded-xl p-3 shadow-lg">
                <div className="flex gap-2">
                    <Button
                        onClick={undoLast}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-9 h-9 p-0"
                        disabled={positions.length === 0}
                    >
                        <Undo2 className="h-3 w-3" />
                    </Button>
                    <Button
                        onClick={clearAll}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-9 h-9 p-0"
                    >
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                        onClick={() => setIsDeleteMode(prev => !prev)}
                        size="sm"
                        className={`
                            rounded-lg w-9 h-9 p-0
                            ${isDeleteMode
                                ? 'bg-red-500 border-red-600 text-white ring-2 ring-white shadow-lg'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }
                        `}
                    >
                        <Eraser className="h-3 w-3" />
                    </Button>
                    <Button
                        onClick={moveFretDown}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-9 h-9 p-0 text-sm"
                        disabled={fretOffset === 0}
                    >
                        ←
                    </Button>
                    <Button
                        onClick={moveFretUp}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg w-9 h-9 p-0 text-sm"
                    >
                        →
                    </Button>
                </div>
            </div>

            {/* Mástil de Guitarra */}
            <div className="bg-gray-800 rounded-xl p-3 shadow-2xl overflow-x-auto">

                {/* Fret numbers row */}
                <div className="flex items-center mb-3 min-w-max">
                    {[0, 1, 2, 3, 4].map((fret) => (
                        <div
                            key={fret}
                            className="flex justify-center items-center w-12"
                        >
                            <div className="text-sm font-bold text-gray-400 lowercase">
                                {fretOffset + fret}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main fretboard */}
                <div className="relative min-w-max">

                    {/* Strings and positions */}
                    <div className="relative z-30">
                        {Array.from({ length: 6 }, (_, stringIndex) => (
                            <div
                                key={stringIndex}
                                className="relative flex items-center mb-2 h-12"
                            >
                                {/* String line */}
                                <div
                                    className={`absolute bg-gray-300 ${
                                        stringIndex < 2 ? 'h-0.5' : stringIndex < 4 ? 'h-0.5' : 'h-1'
                                    }`}
                                    style={{
                                        left: fretOffset > 0 ? '-8px' : '8px',
                                        width: fretOffset > 0 ? '256px' : '240px'
                                    }}
                                />

                                {/* One button per fret */}
                                <div className="relative w-full flex items-center">
                                    {[0, 1, 2, 3, 4].map((fret) => (
                                        <div
                                            key={fret}
                                            className="flex justify-center items-center w-12"
                                        >
                                            <button
                                                onClick={() => setFingerPosition(stringIndex, fret + fretOffset)}
                                                className={`
                                                    w-8 h-8 rounded-full border-2 transition-all duration-200
                                                    active:scale-95 flex flex-col items-center justify-center
                                                    text-xs font-bold relative z-40 leading-none
                                                    ${getFingerAtPosition(stringIndex, fret + fretOffset) !== null
                                                        ? fingerColors[getFingerAtPosition(stringIndex, fret + fretOffset) as keyof typeof fingerColors]
                                                        : isDeleteMode
                                                            ? 'bg-gray-700 border-red-500 text-red-300 hover:bg-gray-600'
                                                            : 'bg-gray-600 active:bg-gray-500 border-gray-500 text-gray-300'
                                                    }
                                                `}
                                            >
                                                {getFingerAtPosition(stringIndex, fret + fretOffset) !== null ? (
                                                    <>
                                                        <div className="text-xs font-bold leading-none">
                                                            {getFingerAtPosition(stringIndex, fret + fretOffset)}
                                                        </div>
                                                        <div className="text-xs opacity-90 leading-none -mt-0.5">
                                                            {getNoteAtPosition(stringIndex, fret + fretOffset)}
                                                        </div>
                                                    </>
                                                ) : isDeleteMode ? (
                                                    <Eraser className="h-4 w-4 text-red-300" />
                                                ) : null}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuitarNeck;