// src/utils/chordRecognition.ts

interface FingerPosition {
    string: number;
    fret: number;
    finger: number;
}

interface ChordCandidate {
    root: string;
    type: string;
    bassNote: string;
    inversion: number;
    score: number;
    completeness: number;
    voicing: string;
    quality: 'perfect' | 'good' | 'partial' | 'ambiguous';
}

// Asegurarse de que las notas estén en MAYÚSCULAS para consistencia global
// CAMBIO AQUÍ: Usar el símbolo musical sostenido '♯' (U+266F)
const chromaticScale = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const stringTuning = ['E', 'B', 'G', 'D', 'A', 'E']; // En MAYÚSCULAS y consistentes

// Definición más completa de acordes con contexto armónico
// Se ajusta 'weight' y 'requiredNotes' para algunos acordes para mejorar la precisión
const chordDefinitions: { [key: string]: { 
    intervals: number[], 
    weight: number, 
    category: string,
    commonInversions: number[],
    requiredNotes: number[], // notas absolutamente necesarias
    optionalNotes: number[], // notas que pueden faltar sin afectar la identidad
    avoidNotes: number[] // notas que invalidan el acorde
}} = {
    // Tríadas básicas
    '': { 
        intervals: [0, 4, 7], 
        weight: 10, 
        category: 'triad',
        commonInversions: [0, 4, 7],
        requiredNotes: [0, 4], 
        optionalNotes: [7], 
        avoidNotes: [3, 6] 
    },
    'm': { 
        intervals: [0, 3, 7], 
        weight: 10, 
        category: 'triad',
        commonInversions: [0, 3, 7],
        requiredNotes: [0, 3],
        optionalNotes: [7],
        avoidNotes: [4, 6]
    },
    'dim': { 
        intervals: [0, 3, 6], 
        weight: 8, // Aumentado para dar más peso a los disminuidos
        category: 'triad',
        commonInversions: [0, 3, 6],
        requiredNotes: [0, 3, 6],
        optionalNotes: [],
        avoidNotes: [4, 7]
    },
    'aug': { 
        intervals: [0, 4, 8], 
        weight: 7, // Aumentado
        category: 'triad',
        commonInversions: [0, 4, 8],
        requiredNotes: [0, 4, 8],
        optionalNotes: [],
        avoidNotes: [3, 7]
    },
    'sus2': { 
        intervals: [0, 2, 7], 
        weight: 9, // Mayor peso ya que son comunes
        category: 'suspended',
        commonInversions: [0, 2, 7],
        requiredNotes: [0, 2, 7],
        optionalNotes: [],
        avoidNotes: [3, 4]
    },
    'sus4': { 
        intervals: [0, 5, 7], 
        weight: 9, // Mayor peso
        category: 'suspended',
        commonInversions: [0, 5, 7],
        requiredNotes: [0, 5, 7],
        optionalNotes: [],
        avoidNotes: [3, 4]
    },
    '5': { 
        intervals: [0, 7], 
        weight: 6, // Un poco más de peso para power chords
        category: 'power',
        commonInversions: [0, 7],
        requiredNotes: [0, 7],
        optionalNotes: [],
        avoidNotes: [2, 3, 4, 5, 6, 8, 9, 10, 11] // Solo raíz y quinta
    },

    // Séptimas
    '7': { 
        intervals: [0, 4, 7, 10], 
        weight: 12, // Muy común, mayor peso
        category: 'seventh',
        commonInversions: [0, 4, 7, 10],
        requiredNotes: [0, 4, 10], 
        optionalNotes: [7],
        avoidNotes: [3, 11]
    },
    'maj7': { 
        intervals: [0, 4, 7, 11], 
        weight: 11, 
        category: 'seventh',
        commonInversions: [0, 4, 7, 11],
        requiredNotes: [0, 4, 11],
        optionalNotes: [7],
        avoidNotes: [3, 10]
    },
    'm7': { 
        intervals: [0, 3, 7, 10], 
        weight: 12, 
        category: 'seventh',
        commonInversions: [0, 3, 7, 10],
        requiredNotes: [0, 3, 10],
        optionalNotes: [7],
        avoidNotes: [4, 11]
    },
    'dim7': { 
        intervals: [0, 3, 6, 9], 
        weight: 9, // Aumentado
        category: 'seventh',
        commonInversions: [0, 3, 6, 9],
        requiredNotes: [0, 3, 6, 9],
        optionalNotes: [],
        avoidNotes: [4, 7, 10, 11]
    },
    'm7b5': { 
        intervals: [0, 3, 6, 10], 
        weight: 9, // Aumentado
        category: 'seventh',
        commonInversions: [0, 3, 6, 10],
        requiredNotes: [0, 3, 6, 10],
        optionalNotes: [],
        avoidNotes: [4, 7, 11]
    },

    // Extensiones
    '6': { 
        intervals: [0, 4, 7, 9], 
        weight: 8, 
        category: 'sixth',
        commonInversions: [0, 4, 7, 9],
        requiredNotes: [0, 4, 9],
        optionalNotes: [7],
        avoidNotes: [3, 10, 11]
    },
    'm6': { 
        intervals: [0, 3, 7, 9], 
        weight: 8, 
        category: 'sixth',
        commonInversions: [0, 3, 7, 9],
        requiredNotes: [0, 3, 9],
        optionalNotes: [7],
        avoidNotes: [4, 10, 11]
    },
    'add9': { 
        intervals: [0, 4, 7, 2], 
        weight: 9, // Más común que un 9 completo
        category: 'added',
        commonInversions: [0, 4, 7, 2],
        requiredNotes: [0, 4, 2],
        optionalNotes: [7],
        avoidNotes: [3, 10, 11]
    },
    '9': { 
        intervals: [0, 4, 7, 10, 2], 
        weight: 10, // Un poco más de peso
        category: 'extended',
        commonInversions: [0, 4, 7, 10],
        requiredNotes: [0, 4, 10, 2], // 9na es ahora requerida para ser un 9
        optionalNotes: [7],
        avoidNotes: [3, 11]
    },
    'maj9': { 
        intervals: [0, 4, 7, 11, 2], 
        weight: 9, 
        category: 'extended',
        commonInversions: [0, 4, 7, 11],
        requiredNotes: [0, 4, 11, 2],
        optionalNotes: [7],
        avoidNotes: [3, 10]
    },
    'm9': { 
        intervals: [0, 3, 7, 10, 2], 
        weight: 10, 
        category: 'extended',
        commonInversions: [0, 3, 7, 10],
        requiredNotes: [0, 3, 10, 2],
        optionalNotes: [7],
        avoidNotes: [4, 11]
    },
    // Añadir acordes alterados si es necesario (ej. 7#9, 7b9, etc.)
    // '7b9': { intervals: [0, 4, 7, 10, 1], weight: 8, category: 'altered', commonInversions: [0, 4, 7, 10], requiredNotes: [0,4,10,1], optionalNotes: [7], avoidNotes: [2,3,11] },
    // '7#9': { intervals: [0, 4, 7, 10, 3], weight: 8, category: 'altered', commonInversions: [0, 4, 7, 10], requiredNotes: [0,4,10,3], optionalNotes: [7], avoidNotes: [1,2,11] },
};

// Orden de prioridad basado en frecuencia de uso y claridad armónica
// Ajustado para dar prioridad a acordes más comunes y distintivos
const chordTypePriority = [
    '', 'm', // Triadas básicas (Mayor, Menor)
    '7', 'm7', 'maj7', // Séptimas dominantes y modales
    'sus4', 'sus2', // Suspendidos
    '6', 'm6', // Sextas
    '9', 'm9', 'maj9', // Novenas
    'dim', 'aug', 'dim7', 'm7b5', // Acordes con tensiones/disminuidos
    'add9', // Acordes añadidos (menos tensión que un 9)
    '5' // Power chord al final, es muy ambiguo
];

// Función mejorada para estandarizar nombres de notas
const normalizeNoteName = (note: string): string => {
    // Mapeo directo a la versión preferida (siempre con sostenidos y en mayúscula)
    // CAMBIO AQUÍ: Usar '♯' en las claves y valores del mapeo
    const enharmonics: { [key: string]: string } = {
        'c#': 'C♯', 'db': 'C♯', // C# / Db -> C♯
        'd#': 'D♯', 'eb': 'D♯', // D# / Eb -> D♯
        'f#': 'F♯', 'gb': 'F♯', // F# / Gb -> F♯
        'g#': 'G♯', 'ab': 'G♯', // G# / Ab -> G♯
        'a#': 'A♯', 'bb': 'A♯', // A# / Bb -> A♯
        // Casos especiales si se usan bemoles para las notas naturales
        'cb': 'B', 'fb': 'E',
        // Asegurarse de que las notas naturales simples también se capitalicen
        'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B',
        // Para inputs que ya estén en mayúsculas (y con # o ♯)
        'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
        'C#': 'C♯', 'D#': 'D♯', 'F#': 'F♯', 'G#': 'G♯', 'A#': 'A♯', // Mapeo de # a ♯
        'C♯': 'C♯', 'D♯': 'D♯', 'F♯': 'F♯', 'G♯': 'G♯', 'A♯': 'A♯', // Si ya viene con ♯

        'Db': 'C♯', 'Eb': 'D♯', 'Gb': 'F♯', 'Ab': 'G♯', 'Bb': 'A♯',
        'Cb': 'B', 'Fb': 'E'
    };

    const trimmedNote = note.trim();
    if (enharmonics[trimmedNote.toLowerCase()]) { // Convertir a minúsculas para el mapeo
        return enharmonics[trimmedNote.toLowerCase()];
    }
    // Fallback para entradas inesperadas, intenta capitalizar la primera letra
    if (trimmedNote.length > 0) {
        // Asegurarse de que si el accidental es #, se reemplace por ♯
        let formatted = trimmedNote.charAt(0).toUpperCase() + trimmedNote.slice(1).toLowerCase();
        return formatted.replace('#', '♯');
    }
    return trimmedNote;
};

const noteNameToIndex = (note: string): number => {
    const normalizedNote = normalizeNoteName(note);
    const index = chromaticScale.indexOf(normalizedNote);
    return index;
};

const getAbsoluteNoteAtIndex = (stringIndex: number, fret: number): number => {
    const openStringNoteIndex = noteNameToIndex(stringTuning[stringIndex]);
    if (openStringNoteIndex === -1) {
        // En un entorno de producción, esto debería ser un error o una nota ignorada
        // console.warn(`Nota de cuerda abierta no reconocida: ${stringTuning[stringIndex]}`);
        return -1;
    }
    return (openStringNoteIndex + fret) % 12;
};

const getInversionName = (bassNote: number, rootNote: number, chordType: string): string => {
    // Esta función no se usa directamente en el nombre final en esta versión,
    // pero podría usarse para análisis más detallado.
    const intervals = chordDefinitions[chordType]?.intervals || [];
    const bassInterval = (bassNote - rootNote + 12) % 12;
    
    if (bassInterval === 0) return ''; // posición fundamental
    
    // Nombres comunes para inversiones (no para el nombre final tipo C/G)
    const intervalNames: { [key: number]: string } = {
        3: '1st', 4: '1st', // Tercera menor/mayor
        6: '2nd', 7: '2nd', // Quinta disminuida/justa 
    };
    
    return intervals.includes(bassInterval) ? (intervalNames[bassInterval] || '') : '';
};

const analyzeVoicing = (notePositions: { note: number, string: number, fret: number }[]): string => {
    if (notePositions.length === 0) return 'unknown';

    const frets = notePositions.map(pos => pos.fret);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    const fretSpan = maxFret - minFret;
    
    if (fretSpan <= 3) return 'close';
    if (fretSpan <= 5) return 'medium';
    return 'open';
};

const calculateChordScore = (
    presentIntervals: number[], 
    definition: typeof chordDefinitions[string],
    bassInterval: number,
    noteCount: number,
    voicing: string,
    chordType: string 
): number => {
    let score = 0;
    
    score += definition.weight;
    
    const requiredPresent = definition.requiredNotes.filter(note => 
        presentIntervals.includes(note)
    ).length;
    const requiredRatio = requiredPresent / definition.requiredNotes.length;
    score += requiredRatio * 20; // Gran bonificación por notas requeridas

    // Penalización por faltar notas requeridas (muy importante)
    if (requiredRatio < 1 && definition.requiredNotes.length > 0) {
        score -= (1 - requiredRatio) * 30; // Penalización más severa
    }
    
    const avoidPresent = definition.avoidNotes.filter(note => 
        presentIntervals.includes(note)
    ).length;
    score -= avoidPresent * 25; // Gran penalización por notas a evitar
    
    const matchedIntervals = presentIntervals.filter(interval => 
        definition.intervals.includes(interval)
    ).length;
    const completeness = matchedIntervals / definition.intervals.length;
    score += completeness * 15;
    
    // Bonificación si todas las notas de la definición están presentes
    if (completeness === 1) score += 10;

    if (definition.commonInversions.includes(bassInterval)) {
        score += 5;
    }
    
    const extraNotes = presentIntervals.filter(interval => 
        !definition.intervals.includes(interval)
    ).length;
    score -= extraNotes * 5; // Penalización por notas extra

    // Bonificación por voicing
    if (voicing === 'close') score += 5; // Mayor bonificación
    else if (voicing === 'medium') score += 2;
    
    // Penalización si el número de notas es muy bajo para el acorde esperado
    if (noteCount < definition.intervals.length - definition.optionalNotes.length && noteCount < 3) {
        score -= 10;
    }

    // Asegurar que la raíz esté siempre presente y sea la nota más baja si no es una inversión reconocida
    if (bassInterval !== 0 && !definition.commonInversions.includes(bassInterval)) {
        score -= 5; // Penalización por inversiones no comunes
    }

    // Penalización si la tercera o quinta están ausentes en tríadas (a menos que sea '5' o 'sus')
    if (definition.category === 'triad' && chordType !== '5' && chordType.indexOf('sus') === -1) {
        if (!presentIntervals.includes(definition.intervals[1])) { // Tercera
            score -= 15; 
        }
        // if (!presentIntervals.includes(definition.intervals[2])) { // Quinta
        //     score -= 5; 
        // }
    }
    
    return Math.max(-100, score); // Permitir puntuaciones negativas para filtrar mejor
};

const determineChordQuality = (
    completeness: number, 
    hasAvoidNotes: boolean, 
    hasAllRequired: boolean
): ChordCandidate['quality'] => {
    if (hasAvoidNotes) return 'ambiguous'; // Notas incorrectas presentes
    if (hasAllRequired && completeness >= 0.95) return 'perfect'; // Casi todas las notas y requeridas
    if (hasAllRequired && completeness >= 0.7) return 'good'; // Suficientes notas y requeridas
    if (completeness >= 0.5) return 'partial'; // Reconocible pero incompleto
    return 'ambiguous'; // Demasiado incompleto o incierto
};

// Función para formatear el nombre del acorde con las reglas de mayúsculas/minúsculas
const formatChordName = (root: string, type: string): string => { 
    // Asegurar que la nota fundamental esté en mayúscula (usando normalize)
    const formattedRoot = normalizeNoteName(root);
    
    // Formatear el tipo de acorde: letras a minúsculas, números/símbolos se mantienen
    let formattedType = '';
    for (const char of type) {
        if (/[A-Z]/.test(char)) { // Si es una letra mayúscula
            formattedType += char.toLowerCase();
        } else { // Si es un número, un símbolo (#, b, ♭) o ya es minúscula
            formattedType += char;
        }
    }
    
    let chordName = formattedRoot + formattedType;
    
    return chordName;
};

export const recognizeChord = (positions: FingerPosition[], fretOffset: number = 0): string => {
    if (positions.length === 0) {
        return 'toca un acorde'; // Más amigable para el usuario
    }

    const notePositions = positions
        .map(pos => ({
            note: getAbsoluteNoteAtIndex(pos.string, pos.fret + fretOffset),
            string: pos.string,
            fret: pos.fret + fretOffset
        }))
        .filter(pos => pos.note !== -1);

    if (notePositions.length === 0) {
        return 'toca un acorde';
    }

    // Obtener notas únicas y ordenarlas para el análisis
    const uniqueNotes = [...new Set(notePositions.map(pos => pos.note))].sort((a, b) => a - b);
    
    if (uniqueNotes.length === 1) {
        return normalizeNoteName(chromaticScale[uniqueNotes[0]]);
    }

    // Mínimo de notas para considerar un acorde (puede ser 2 para power chords, 3 para tríadas)
    if (uniqueNotes.length < 2) { 
        return 'nota única'; // Si tienes 0 o 1 nota después de filtrado
    }

    const bassNote = uniqueNotes[0]; // La nota más grave es la candidata a nota de bajo
    const voicing = analyzeVoicing(notePositions);
    const candidates: ChordCandidate[] = [];

    // Analizar cada nota única como posible fundamental
    for (const rootNote of uniqueNotes) {
        const intervalsFromRoot = uniqueNotes
            .map(note => (note - rootNote + 12) % 12)
            .sort((a, b) => a - b);

        for (const chordType of chordTypePriority) {
            const definition = chordDefinitions[chordType];
            if (!definition) continue;

            const bassInterval = (bassNote - rootNote + 12) % 12;
            
            const hasRequiredNotes = definition.requiredNotes.every(note => 
                intervalsFromRoot.includes(note)
            );
            
            const hasAvoidNotes = definition.avoidNotes.some(note => 
                intervalsFromRoot.includes(note)
            );
            
            // Solo considerar candidatos que no tengan notas a evitar
            if (!hasAvoidNotes) {
                const score = calculateChordScore(
                    intervalsFromRoot, 
                    definition, 
                    bassInterval, 
                    uniqueNotes.length, 
                    voicing,
                    chordType 
                );

                // Un umbral de puntuación más exigente para ser un candidato inicial
                if (score > 10) { 
                    const completeness = intervalsFromRoot.filter(interval => 
                        definition.intervals.includes(interval)
                    ).length / definition.intervals.length;

                    const quality = determineChordQuality(completeness, hasAvoidNotes, hasRequiredNotes);
                    
                    candidates.push({
                        root: chromaticScale[rootNote],
                        type: chordType,
                        bassNote: chromaticScale[bassNote],
                        inversion: bassInterval, // Guardar el intervalo del bajo directamente
                        score,
                        completeness,
                        voicing,
                        quality
                    });
                }
            }
        }
    }

    if (candidates.length === 0) {
        // Fallback: si no se encontró un acorde con los criterios normales,
        // intentar identificar acordes básicos con criterios más laxos,
        // pero solo si hay un número razonable de notas
        if (uniqueNotes.length >= 2) {
            for (const rootNote of uniqueNotes) {
                const intervalsFromRoot = uniqueNotes
                    .map(note => (note - rootNote + 12) % 12)
                    .sort((a, b) => a - b);

                if (intervalsFromRoot.includes(0)) {
                    if (intervalsFromRoot.includes(4) && intervalsFromRoot.includes(7)) {
                        return formatChordName(chromaticScale[rootNote], ''); // Mayor
                    }
                    if (intervalsFromRoot.includes(3) && intervalsFromRoot.includes(7)) {
                        return formatChordName(chromaticScale[rootNote], 'm'); // Menor
                    }
                    if (intervalsFromRoot.includes(0) && intervalsFromRoot.includes(7)) {
                        return formatChordName(chromaticScale[rootNote], '5'); // Power Chord (R-5)
                    }
                }
            }
        }
        return 'acorde desconocido';
    }

    // Ordenar candidatos:
    // 1. Mejor calidad (perfect > good > partial > ambiguous)
    // 2. Mayor puntuación
    // 3. Acordes en posición fundamental (inversion 0) tienen prioridad
    // 4. Acordes con menos notas extra
    candidates.sort((a, b) => {
        const qualityOrder = { 'perfect': 4, 'good': 3, 'partial': 2, 'ambiguous': 1 };
        const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality];
        if (qualityDiff !== 0) return qualityDiff;
        
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;

        // Priorizar la posición fundamental (bassNote es la raíz)
        const aIsRootBass = normalizeNoteName(a.bassNote) === normalizeNoteName(a.root);
        const bIsRootBass = normalizeNoteName(b.bassNote) === normalizeNoteName(b.root);
        if (aIsRootBass && !bIsRootBass) return -1;
        if (!aIsRootBass && bIsRootBass) return 1;

        // Desempate por número de notas extra
        const aExtraNotes = uniqueNotes.filter(interval => 
            !chordDefinitions[a.type].intervals.includes((interval - noteNameToIndex(a.root) + 12) % 12)
        ).length;
        const bExtraNotes = uniqueNotes.filter(interval => 
            !chordDefinitions[b.type].intervals.includes((interval - noteNameToIndex(b.root) + 12) % 12)
        ).length;
        if (aExtraNotes !== bExtraNotes) return aExtraNotes - bExtraNotes;

        // Desempate final: priorizar los acordes de menor complejidad (menos intervalos en la definición)
        return chordDefinitions[a.type].intervals.length - chordDefinitions[b.type].intervals.length;
    });

    const bestChord = candidates[0];
    
    return formatChordName(bestChord.root, bestChord.type);
};