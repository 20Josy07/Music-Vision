
"use client";

import type { Track, RepeatMode } from '@/lib/types';
import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { 
  checkAndSetupToken, 
  getCurrentPlaybackState, 
  getMyDevices, 
  play as spotifyPlay,
  pausePlayback as spotifyPause,
  skipToNextTrack as spotifySkipNext,
  skipToPreviousTrack as spotifySkipPrev,
  seekToPosition as spotifySeek,
  setSpotifyVolume as spotifySetVolume,
  setShuffle as spotifySetShuffle,
  setRepeat as spotifySetRepeat,
  logoutSpotify as performSpotifyLogout, // Renamed to avoid conflict
  spotifyApi // Direct access for token check
} from '@/services/spotify';
import type { SpotifyPlaybackState, SpotifyTrackItem, SpotifyDevice } from '@/types/spotify';


// Helper to map Spotify Track Item to our App Track type
const mapSpotifyItemToAppTrack = (item: SpotifyTrackItem): Track => ({
  id: item.id,
  title: item.name,
  artist: item.artists.map(a => a.name).join(', '),
  album: item.album.name,
  duration: Math.floor(item.duration_ms / 1000),
  artworkUrl: item.album.images?.[0]?.url || item.album.images?.[1]?.url || `https://placehold.co/300x300/cccccc/969696.png?text=${encodeURIComponent(item.name.substring(0,2))}`,
  audioSrc: item.preview_url || undefined, 
  spotifyUri: item.uri,
  isSpotifyTrack: true,
  dataAiHint: `${item.name.substring(0,15)} ${item.artists[0]?.name.substring(0,10) || 'song'}`.toLowerCase(),
});


interface PlayerContextState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackProgress: number; // 0 to 1
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  currentQueueIndex: number;
  isFullScreenPlayerVisible: boolean;
  isSpotifyConnected: boolean;
  activeSpotifyDeviceId: string | null;
  playTrack: (track: Track, playFromQueue?: boolean, index?: number) => Promise<void>;
  playPlaylist: (tracks: Track[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seek: (progress: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeatMode: () => Promise<void>;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;
  toggleFullScreenPlayer: () => void;
  setPlaybackProgress: React.Dispatch<React.SetStateAction<number>>;
  syncWithSpotifyPlayback: (isControlAction?: boolean) => Promise<void>;
  checkSpotifyConnection: () => Promise<void>; // For explicitly re-checking connection
}

const PlayerContext = createContext<PlayerContextState | undefined>(undefined);

const MOCK_TRACKS: Track[] = [];

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [originalQueue, setOriginalQueue] = useState<Track[]>(MOCK_TRACKS);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [isFullScreenPlayerVisible, setIsFullScreenPlayerVisible] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [activeSpotifyDeviceId, setActiveSpotifyDeviceId] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNextRefCallback = useRef<() => Promise<void>>(async () => {});

  const checkSpotifyConnection = useCallback(async () => {
    const connected = await checkAndSetupToken(); // checkAndSetupToken now can attempt refresh
    setIsSpotifyConnected(connected);
    if (connected) {
      try {
        const devices = await getMyDevices();
        const activeDevice = devices.find(d => d.is_active);
        if (activeDevice?.id) {
          setActiveSpotifyDeviceId(activeDevice.id);
        } else if (devices.length > 0 && devices[0].id) {
          setActiveSpotifyDeviceId(devices[0].id);
          console.log(`No active Spotify device, falling back to: ${devices[0].name}`);
        } else {
          console.warn("No Spotify devices found or available.");
          setActiveSpotifyDeviceId(null); // Ensure it's null if no device
        }
      } catch (err) {
        console.error("Error in checkSpotifyConnection during getMyDevices:", err);
        setIsSpotifyConnected(false); // If fetching devices fails, assume not truly connected
        setActiveSpotifyDeviceId(null);
      }
    } else {
      // Not connected, clear device ID
      setActiveSpotifyDeviceId(null);
    }
  }, [setIsSpotifyConnected, setActiveSpotifyDeviceId]);


  const syncWithSpotifyPlayback = useCallback(async (isControlAction = false) => {
    if (!isSpotifyConnected || !spotifyApi.getAccessToken()) {
      // If we think we are connected but have no token, re-check. This might trigger a refresh.
      if (isSpotifyConnected) await checkSpotifyConnection();
      if (!spotifyApi.getAccessToken()) return; // Still no token, exit
    }

    const spotifyState = await getCurrentPlaybackState();
    if (spotifyState) {
      setIsPlaying(spotifyState.is_playing);
      if (spotifyState.item) {
        const currentlyPlayingSpotifyTrack = mapSpotifyItemToAppTrack(spotifyState.item as SpotifyTrackItem);
        if (currentTrack?.id !== currentlyPlayingSpotifyTrack.id || isControlAction || currentTrack?.isSpotifyTrack !== currentlyPlayingSpotifyTrack.isSpotifyTrack) {
           setCurrentTrack(currentlyPlayingSpotifyTrack);
        }
        if (spotifyState.item.duration_ms > 0 && spotifyState.progress_ms !== null) {
          setPlaybackProgress(spotifyState.progress_ms / spotifyState.item.duration_ms);
        }
      } else if (!isControlAction) { 
        // If Spotify is connected but not playing anything, reflect that locally for Spotify tracks
        if (currentTrack?.isSpotifyTrack) {
            // setCurrentTrack(null); // Or keep current track but set isPlaying false
            setIsPlaying(false);
        }
      }
      setShuffle(spotifyState.shuffle_state);
      setRepeatMode(spotifyState.repeat_state as RepeatMode); 
      if (spotifyState.device) {
        if (spotifyState.device.id && activeSpotifyDeviceId !== spotifyState.device.id) {
            setActiveSpotifyDeviceId(spotifyState.device.id);
        }
        if (spotifyState.device.volume_percent !== null) {
            const newVolume = spotifyState.device.volume_percent / 100;
            setVolume(newVolume); // This will also update isMuted via its own effect if volume changes
            if (newVolume === 0 && !isMuted) setIsMuted(true);
            else if (newVolume > 0 && isMuted) setIsMuted(false);
        }
      }
      // If Spotify is playing, ensure local audio is paused
      if (spotifyState.is_playing && audio && !audio.paused) {
        audio.pause();
      }
    } else {
        // getCurrentPlaybackState returned null, might mean token expired or other issue
        console.log("syncWithSpotifyPlayback: getCurrentPlaybackState returned null. Re-checking connection.");
        await checkSpotifyConnection(); // This will try to refresh if needed
    }
  }, [isSpotifyConnected, audio, currentTrack, activeSpotifyDeviceId, isMuted, checkSpotifyConnection, setCurrentTrack, setIsPlaying, setPlaybackProgress, setShuffle, setRepeatMode, setVolume, setIsMuted, setActiveSpotifyDeviceId]);


  const playTrack = useCallback(async (track: Track, playFromQueue: boolean = false, index?: number) => {
    if (track.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId && track.spotifyUri) {
      const result = await spotifyPlay({ uris: [track.spotifyUri], device_id: activeSpotifyDeviceId });
      if (audio && !audio.paused) { audio.pause(); audio.src = ''; }
      if (result === null && !spotifyApi.getAccessToken()) { // Play call failed, likely due to auth
        setIsSpotifyConnected(false); // Mark as disconnected
        console.warn("Spotify play failed, token might be invalid. Marked as disconnected.");
        return;
      }
      setCurrentTrack(track);
      setIsPlaying(true);
      if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
      setTimeout(() => syncWithSpotifyPlayback(true), 500); 
    } else if (track.audioSrc && audio) {
      if (currentTrack?.isSpotifyTrack && isPlaying) { // If switching from Spotify to local
          await spotifyPause({device_id: activeSpotifyDeviceId || undefined });
      }
      if (audio.src !== track.audioSrc) audio.src = track.audioSrc;
      audio.currentTime = 0;
      try {
        await audio.play();
        setCurrentTrack(track);
        setIsPlaying(true);
        if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
      } catch (e) { console.error("Error playing local audio:", e); setIsPlaying(false); }
    } else if (!track.audioSrc && !track.isSpotifyTrack) {
        if (currentTrack?.isSpotifyTrack && isPlaying) { // If switching from Spotify to conceptual
             await spotifyPause({device_id: activeSpotifyDeviceId || undefined });
        }
        setCurrentTrack(track);
        setIsPlaying(true); 
        if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
        if (audio && !audio.paused) { audio.pause(); audio.src = '';} 
        console.log("Track has no audioSrc and is not a Spotify track. Conceptually playing:", track.title);
    }
  }, [audio, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, currentTrack, isPlaying, setCurrentTrack, setIsPlaying, setCurrentQueueIndex, setIsSpotifyConnected]);

  const togglePlayPause = useCallback(async () => {
    if (!currentTrack) {
      if (queue.length > 0) await playTrack(queue[0], true, 0);
      return;
    }
    if (currentTrack.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      let result;
      if (isPlaying) result = await spotifyPause({ device_id: activeSpotifyDeviceId });
      else result = await spotifyPlay({ device_id: activeSpotifyDeviceId }); 
      
      if (result === null && !spotifyApi.getAccessToken()) { // Auth failed
        setIsSpotifyConnected(false);
        return;
      }
      setIsPlaying(!isPlaying); 
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else if (audio) {
      if (isPlaying) audio.pause();
      else try { await audio.play(); } catch (e) { console.error("Error toggling local audio:", e); setIsPlaying(false); return; }
      setIsPlaying(!isPlaying);
    }
  }, [currentTrack, audio, isPlaying, queue, playTrack, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setIsPlaying, setIsSpotifyConnected]);

  const playNext = useCallback(async () => {
    if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySkipNext({ device_id: activeSpotifyDeviceId });
       if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else { 
      if (queue.length === 0) return;
      let nextIndex = currentQueueIndex + 1;
      if (repeatMode === 'one' && currentTrack && isPlaying) {
        if (audio) { audio.currentTime = 0; if (audio.paused) audio.play().catch(e=>console.error(e));} 
        else setPlaybackProgress(0);
        return;
      }
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all' || repeatMode === 'context') nextIndex = 0;
        else { setIsPlaying(false); return; }
      }
      if (queue[nextIndex]) await playTrack(queue[nextIndex], true, nextIndex);
    }
  }, [currentTrack, queue, currentQueueIndex, repeatMode, isPlaying, audio, playTrack, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setPlaybackProgress, setIsPlaying, setIsSpotifyConnected]);

  const playPrevious = useCallback(async () => {
     if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySkipPrev({ device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else { 
      if (queue.length === 0) return;
      if (audio && currentTrack && audio.currentTime > 3 && isPlaying) { // Only rewind if playing and past 3s 
        audio.currentTime = 0;
        // No need to call audio.play() as it's already playing
        return;
      } else if (audio && currentTrack && audio.currentTime > 3 && !isPlaying) { // If paused but past 3s, rewind and stay paused
         audio.currentTime = 0;
         setPlaybackProgress(0); // Reflect rewind in UI
         return;
      }
      // If currentTime <= 3 or not an audio track, proceed to previous logic
      let prevIndex = currentQueueIndex - 1;
      if (prevIndex < 0) {
        if (repeatMode === 'all' || repeatMode === 'context') prevIndex = queue.length - 1; 
        else { 
            if (audio && currentTrack) { 
                audio.currentTime = 0; 
                setPlaybackProgress(0);
                if (!isPlaying) { 
                    // If it was paused, and we are at the beginning, don't auto-play. 
                    // User has to explicitly play.
                } else if (audio.paused) {
                   audio.play().catch(e=>console.error("Error re-playing after skip-to-start:", e));
                }
            } else if (queue.length > 0) { // No current audio track, but queue exists
                 await playTrack(queue[0], true, 0); 
            }
            return;
        }
      }
      if (queue[prevIndex]) await playTrack(queue[prevIndex], true, prevIndex);
    }
  }, [currentTrack, audio, isPlaying, queue, currentQueueIndex, repeatMode, playTrack, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setIsPlaying, setPlaybackProgress, setIsSpotifyConnected]);
  
  const seek = useCallback(async (progress: number) => {
    if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId && currentTrack.duration > 0) {
      const result = await spotifySeek(Math.round(progress * currentTrack.duration * 1000), { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setPlaybackProgress(progress); 
      setTimeout(() => syncWithSpotifyPlayback(true), 500); 
    } else if (audio && currentTrack && currentTrack.duration > 0) {
      audio.currentTime = progress * currentTrack.duration;
      setPlaybackProgress(progress);
    }
  }, [currentTrack, audio, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setPlaybackProgress, setIsSpotifyConnected]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    if (isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySetVolume(Math.round(newVolume * 100), { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); /* No return here, still update local state */ }
    } else if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
    // setIsMuted handled by useEffect watching volume
    if (newVolume > 0 && isMuted) setLastVolume(newVolume); 
  }, [audio, isSpotifyConnected, activeSpotifyDeviceId, isMuted, setVolume, setLastVolume, setIsSpotifyConnected]); // Removed setIsMuted as it's handled by effect

  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted, setIsMuted]);

  const toggleMute = useCallback(async () => {
    const newMutedState = !isMuted;
    const targetVolume = newMutedState ? 0 : (lastVolume > 0 ? lastVolume : 0.1); 
    
    if (isSpotifyConnected && activeSpotifyDeviceId) {
        const result = await spotifySetVolume(Math.round(targetVolume * 100), { device_id: activeSpotifyDeviceId });
         if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); /* No return, still update local state */ }
    } else if (audio) {
        audio.volume = targetVolume;
    }
    
    if (!newMutedState && volume > 0) setLastVolume(volume); 
    else if (newMutedState && volume > 0) setLastVolume(volume); 
    else if (newMutedState && volume === 0) setLastVolume(0.75); 

    setVolume(targetVolume); 
    // setIsMuted(newMutedState); // This will be re-affirmed by the useEffect above or sync

  }, [audio, isMuted, volume, lastVolume, isSpotifyConnected, activeSpotifyDeviceId, setVolume, setLastVolume, setIsSpotifyConnected]); // Removed setIsMuted
  
  const toggleShuffle = useCallback(async () => {
    const newShuffleState = !shuffle;
    if (isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySetShuffle(newShuffleState, { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else { 
      if (newShuffleState) {
        setOriginalQueue([...queue]); 
        const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
        setQueue(shuffledQueue);
        if (currentTrack) {
          const newIndex = shuffledQueue.findIndex(t => t.id === currentTrack.id);
          setCurrentQueueIndex(newIndex !== -1 ? newIndex : 0);
        }
      } else {
        setQueue([...originalQueue]);
        if (currentTrack) {
          const newIndex = originalQueue.findIndex(t => t.id === currentTrack.id);
          setCurrentQueueIndex(newIndex !== -1 ? newIndex : 0);
        }
      }
      setShuffle(newShuffleState);
    }
  }, [shuffle, queue, currentTrack, originalQueue, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setShuffle, setQueue, setOriginalQueue, setCurrentQueueIndex, setIsSpotifyConnected]);

  const cycleRepeatMode = useCallback(async () => {
    let newRepeatStateSdk: RepeatMode = 'none';
    let newRepeatStateSpotify: 'off' | 'track' | 'context' = 'off';

    if (repeatMode === 'none' || repeatMode === 'off') {
        newRepeatStateSdk = 'all'; 
        newRepeatStateSpotify = 'context'; 
    } else if (repeatMode === 'all' || repeatMode === 'context') {
        newRepeatStateSdk = 'one';
        newRepeatStateSpotify = 'track';
    } else { 
        newRepeatStateSdk = 'none';
        newRepeatStateSpotify = 'off';
    }
    
    if (isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySetRepeat(newRepeatStateSpotify, { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } 
    // Always update local state for immediate UI feedback / local playback
    setRepeatMode(newRepeatStateSdk);
    
  }, [repeatMode, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setRepeatMode, setIsSpotifyConnected]);
  
  const playPlaylist = useCallback(async (tracks: Track[], startIndex: number = 0) => {
    const newQueue = [...tracks]; 
    setOriginalQueue([...newQueue]); 
    
    if (isSpotifyConnected && activeSpotifyDeviceId && tracks.length > 0 && tracks.every(t => t.isSpotifyTrack && t.spotifyUri)) {
        const uris = tracks.map(t => t.spotifyUri!);
        const result = await spotifyPlay({ uris: uris, offset: { position: startIndex }, device_id: activeSpotifyDeviceId });
        if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
        
        const displayQueue = shuffle ? [...newQueue].sort(() => Math.random() - 0.5) : newQueue;
        setQueue(displayQueue);

        setTimeout(() => syncWithSpotifyPlayback(true), 1000); 

    } else { 
        const localPlayQueue = shuffle ? [...newQueue].sort(() => Math.random() - 0.5) : newQueue;
        setQueue(localPlayQueue);
        if (localPlayQueue.length > 0 && startIndex < localPlayQueue.length) {
          await playTrack(localPlayQueue[startIndex], true, startIndex);
        } else {
          setCurrentTrack(null);
          setIsPlaying(false);
          setCurrentQueueIndex(-1);
        }
    }
  }, [playTrack, shuffle, isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, setQueue, setOriginalQueue, setCurrentTrack, setIsPlaying, setCurrentQueueIndex, setIsSpotifyConnected]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
    if(!shuffle) setOriginalQueue(prev => [...prev, track]); 
  }, [shuffle, setQueue, setOriginalQueue]);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
    setOriginalQueue(prev => prev.filter(t => t.id !== trackId));
  }, [setQueue, setOriginalQueue]);
  
  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue(prevQueue => {
      const result = Array.from(prevQueue);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      if (currentTrack) {
        const newCurrentIndex = result.findIndex(track => track.id === currentTrack.id);
        if (newCurrentIndex !== -1) setCurrentQueueIndex(newCurrentIndex);
      }
      return result;
    });
    if(!shuffle) {
        setOriginalQueue(prevQueue => {
            const result = Array.from(prevQueue);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }
  }, [currentTrack, shuffle, setQueue, setOriginalQueue, setCurrentQueueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setOriginalQueue([]);
  }, [setQueue, setOriginalQueue]);

  const toggleFullScreenPlayer = useCallback(() => {
    setIsFullScreenPlayerVisible(prev => !prev);
  }, [setIsFullScreenPlayerVisible]);
  

  useEffect(() => {
    playNextRefCallback.current = playNext;
  }, [playNext]);

  useEffect(() => {
    const newAudio = new Audio();
    setAudio(newAudio);
    
    const updateProgress = () => {
        if (newAudio.duration && !currentTrack?.isSpotifyTrack) { 
            setPlaybackProgress(newAudio.currentTime / newAudio.duration);
        }
    };
    const handleEnded = () => { if (!currentTrack?.isSpotifyTrack) playNextRefCallback.current(); };

    newAudio.addEventListener('timeupdate', updateProgress);
    newAudio.addEventListener('ended', handleEnded);
    newAudio.addEventListener('loadedmetadata', updateProgress); 
    
    return () => {
      newAudio.removeEventListener('timeupdate', updateProgress);
      newAudio.removeEventListener('ended', handleEnded);
      newAudio.removeEventListener('loadedmetadata', updateProgress);
      newAudio.pause();
      setAudio(null); 
    };
  }, [currentTrack?.isSpotifyTrack]); 

  useEffect(() => {
    checkSpotifyConnection(); // Initial check

    const handleAuthError = () => {
      console.log("PlayerContext: Detected Spotify auth error. Updating connection status.");
      setIsSpotifyConnected(false);
      setActiveSpotifyDeviceId(null);
      // Optionally clear current track if it's a Spotify track and we can no longer control it
      // if (currentTrack?.isSpotifyTrack) {
      //   setCurrentTrack(null);
      //   setIsPlaying(false);
      // }
    };

    window.addEventListener('spotifyAuthError', handleAuthError);
    
    return () => {
        window.removeEventListener('spotifyAuthError', handleAuthError);
    };

  }, [checkSpotifyConnection]);


  useEffect(() => {
    if (isSpotifyConnected && spotifyApi.getAccessToken()) {
      syncWithSpotifyPlayback(); 
      
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      
      const interval = (isFullScreenPlayerVisible && currentTrack?.isSpotifyTrack) ? 1500 : 50; // Changed 50000 to 50
      syncIntervalRef.current = setInterval(() => syncWithSpotifyPlayback(), interval);
    } else {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    }
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [isSpotifyConnected, syncWithSpotifyPlayback, isFullScreenPlayerVisible, currentTrack?.isSpotifyTrack]);


  useEffect(() => {
    if(audio && currentTrack && !currentTrack.isSpotifyTrack && currentTrack.audioSrc) {
      if (isPlaying && audio.paused) {
        audio.play().catch(e => console.error("Error playing local audio (effect):", e));
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
      audio.volume = isMuted ? 0 : volume;
    } else if (audio && (!currentTrack || currentTrack?.isSpotifyTrack || !currentTrack.audioSrc)) { 
        if (!audio.paused) audio.pause();
        if (audio.src) audio.src = ''; 
    }
  }, [isPlaying, currentTrack, audio, volume, isMuted]);


  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, playbackProgress, volume, isMuted, shuffle, repeatMode, queue, currentQueueIndex, isFullScreenPlayerVisible,
      isSpotifyConnected, activeSpotifyDeviceId,
      playTrack, playPlaylist, togglePlayPause, playNext, playPrevious, seek, setVolume: handleSetVolume, toggleMute, toggleShuffle, cycleRepeatMode,
      addToQueue, removeFromQueue, reorderQueue, clearQueue, toggleFullScreenPlayer, setPlaybackProgress, syncWithSpotifyPlayback,
      checkSpotifyConnection
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

