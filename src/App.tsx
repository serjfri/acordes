import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import SongList from "./pages/SongList";
import SongEditor from "./pages/SongEditor";
import NotFound from "./pages/NotFound";
import SongDetail from "./pages/SongDetail";
// IMPORTAMOS EL CLIENTE DE SUPABASE
import { supabase } from './supabaseClient';
import { toast } from "sonner"; // Asegúrate de que toast esté importado si lo usas aquí

const queryClient = new QueryClient();

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

interface Song {
    id: string;
    title: string;
    chords: Chord[];
}

const App = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true); // Nuevo estado para la carga

    // EFECTO PARA CARGAR CANCIONES DESDE SUPABASE AL INICIO
    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            console.log('=== CARGANDO CANCIONES DESDE SUPABASE ===');
            const { data, error } = await supabase
                .from('songs') // 'songs' es el nombre de tu tabla
                .select('*') // Selecciona todas las columnas
                .order('title', { ascending: true }); // Opcional: ordenar por título

            if (error) {
                console.error('Error al cargar canciones desde Supabase:', error);
                toast.error('Error al cargar canciones: ' + error.message);
            } else {
                console.log('Canciones cargadas de Supabase:', data);
                // Supabase guarda los 'chords' como JSONB, ya se parsea automáticamente
                setSongs(data || []); 
            }
            setLoading(false);
        };

        fetchSongs();
    }, []); // Se ejecuta solo una vez al montar

    // EFECTO PARA GUARDAR/ACTUALIZAR CANCIONES EN SUPABASE CUANDO CAMBIAN
    // Este efecto reemplaza los dos useEffect anteriores que guardaban en localStorage
    useEffect(() => {
        // Solo guardar si no estamos en la carga inicial
        if (loading) return; 

        const upsertSongsToSupabase = async () => {
            if (songs.length === 0) {
                // Si no hay canciones, limpia la base de datos (opcional, considera tu lógica de negocio)
                // O simplemente no hagas nada si ya está vacía
                console.log('No hay canciones para guardar, omitiendo upsert.');
                return;
            }

            console.log('=== GUARDANDO CANCIONES EN SUPABASE ===');
            console.log('Canciones a guardar:', songs);

            // Supabase solo puede hacer 'upsert' de múltiples filas si todas tienen 'id'
            // y si el 'id' es la clave primaria.
            // Para asegurar que los "chords" se guardan como JSONB, Supabase lo maneja
            // automáticamente si el tipo de columna es jsonb.

            const { error } = await supabase
                .from('songs')
                .upsert(songs, { onConflict: 'id' }); // 'onConflict: "id"' actualiza si el id ya existe

            if (error) {
                console.error('Error al guardar canciones en Supabase:', error);
                toast.error('Error al guardar canciones: ' + error.message);
            } else {
                console.log('Canciones guardadas/actualizadas en Supabase.');
            }
        };

        const saveCurrentSongToSupabase = async () => {
            console.log('=== GUARDANDO CANCIÓN ACTUAL EN LOCALSTORAGE (TEMPORALMENTE) ===');
            // Mantendremos currentSong en localStorage por ahora,
            // ya que no hay un concepto de "canción actual activa" en la DB de Supabase.
            // La canción actual se cargará dinámicamente al navegar.
            if (currentSong) {
                localStorage.setItem('guitar-app-current-song', JSON.stringify(currentSong));
            } else {
                localStorage.removeItem('guitar-app-current-song');
            }
            console.log('Canción actual guardada:', currentSong);
        };
        
        // Ejecutar la lógica de guardado
        upsertSongsToSupabase();
        saveCurrentSongToSupabase(); // Esto sigue usando localStorage para la canción actual
    }, [songs, loading, currentSong]); // Dependencias: songs, loading y currentSong

    // También necesitamos ajustar la función `setSongs` pasada a otros componentes
    // para que dispare el guardado en Supabase, aunque el useEffect ya lo hará.
    // Lo importante es que cuando una canción se crea o se actualiza,
    // el estado `songs` se actualice, y el useEffect se encargue del resto.

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Cargando canciones...</p>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {/* CAMBIO AQUÍ: Añadir basename para la ruta base de GitHub Pages */}
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <Index 
                                    songs={songs}
                                    setSongs={setSongs}
                                    currentSong={currentSong}
                                    setCurrentSong={setCurrentSong}
                                />
                            } 
                        />
                        <Route 
                            path="/songs" 
                            element={
                                <SongList 
                                    songs={songs} 
                                    onSelectSong={setCurrentSong}
                                />
                            } 
                        />
                        <Route 
                            path="/song-detail/:songId" 
                            element={
                                <SongDetail 
                                    songs={songs}
                                    setCurrentSong={setCurrentSong}
                                />
                            } 
                        />
                        <Route 
                            path="/song/:songId" 
                            element={
                                <SongEditor 
                                    songs={songs}
                                    setSongs={setSongs}
                                    currentSong={currentSong}
                                    setCurrentSong={setCurrentSong}
                                />
                            } 
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;