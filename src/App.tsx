import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import SongEditor from './pages/SongEditor';
import { Toaster } from 'sonner';

// === IMPORTACIONES DE FIREBASE ===
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore'; 
import { app } from './firebase'; 
// === FIN IMPORTACIONES DE FIREBASE ===

// === IMPORTACIÓN DE TIPOS CENTRALIZADOS ===
import { Song } from './types'; 
// === FIN IMPORTACIÓN DE TIPOS ===

const db = getFirestore(app); 
const SONGS_COLLECTION_NAME = 'songs'; 

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false); 

  // Simulación de inicialización de autenticación
  useEffect(() => {
    setIsAuthReady(true); 
  }, []);

  // EFECTO PARA CARGAR CANCIONES DESDE FIRESTORE AL INICIO
  useEffect(() => {
    const fetchSongs = async () => {
      if (!isAuthReady) return; 

      setLoading(true);
      console.log('=== CARGANDO CANCIONES DESDE FIRESTORE ===');
      try {
        const querySnapshot = await getDocs(collection(db, SONGS_COLLECTION_NAME));
        const songsList: Song[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            // === CAMBIO CLAVE 1: Asegura que el título siempre sea un string, por defecto vacío ===
            title: (data.title as string) || '', 
            // Importante: Asegúrate de parsear el JSON si los acordes se guardan como string
            chords: typeof data.chords === 'string' ? JSON.parse(data.chords) : data.chords || []
          };
        });
        setSongs(songsList);
        console.log('Canciones cargadas de Firestore:', songsList);
      } catch (e: any) {
        console.error("Error al cargar las canciones desde Firestore:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [isAuthReady]);

  // EFECTO PARA GUARDAR CAMBIOS EN CANCIONES EXISTENTES EN FIRESTORE
  useEffect(() => {
    const saveExistingSongsToFirestore = async () => {
      // Solo guardar si ya no estamos cargando y la autenticación está lista
      // Y si hay canciones para guardar (y no es la carga inicial vacía)
      if (loading || !isAuthReady || songs.length === 0) return; 

      console.log('=== SINCRONIZANDO CAMBIOS EN CANCIONES EXISTENTES EN FIRESTORE ===');
      try {
        for (const song of songs) {
          // === CAMBIO CLAVE 2: Verifica que el título NO sea undefined antes de guardar ===
          if (typeof song.title === 'undefined') {
              console.warn(`Skipping save for song ID: ${song.id} due to undefined title. Please check this document in Firestore.`);
              // Puedes optar por saltar esta canción o darle un título por defecto aquí
              continue; // Saltamos la canción con título indefinido para evitar el error
          }

          const songRef = doc(db, SONGS_COLLECTION_NAME, song.id);
          await setDoc(songRef, {
            title: song.title,
            chords: JSON.stringify(song.chords) 
          });
        }
        console.log('Cambios en canciones existentes guardados en Firestore.');
      } catch (e: any) {
        console.error("Error al guardar canciones en Firestore:", e);
        // Si el error persiste, registra la canción que lo causa para depuración
        if (e.message && e.message.includes('Unsupported field value: undefined')) {
            console.error("Posible causa: Un campo tiene 'undefined'. Revisa los datos de las canciones.");
        }
      }
    };

    const handler = setTimeout(() => {
      saveExistingSongsToFirestore();
    }, 1000); 

    return () => {
      clearTimeout(handler); 
    };
  }, [songs, loading, isAuthReady]); 


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando canciones...</p>
      </div>
    );
  }

  return (
<Router basename={import.meta.env.DEV ? '' : '/acordes'}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route 
            path="/" 
            element={
              <Index 
                songs={songs}
                setSongs={setSongs}
                db={db} 
              />
            } 
          />
          <Route 
            path="/song/:songId" 
            element={
              <SongEditor 
                songs={songs} 
                setSongs={setSongs} 
              />
            } 
          />
        </Routes>
      </div>
      <Toaster theme="dark" position="bottom-right" richColors />
    </Router>
  );
};

export default App;
