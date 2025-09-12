// src/types.ts

export interface FingerPosition {
  string: number;
  fret: number;
  finger: number;
}

export interface Chord {
  id: string;
  name: string;
  positions: FingerPosition[];
  fretOffset: number; // Asegúrate de que esta propiedad esté presente
}

export interface Song {
  id: string;
  title: string;
  chords: Chord[];
}
