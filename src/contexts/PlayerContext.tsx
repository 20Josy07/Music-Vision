
"use client";

import type { Track, RepeatMode } from '@/lib/types';
import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
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
  logoutSpotify as performSpotifyLogout, 
  spotifyApi 
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
  source: 'spotify',
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
  checkSpotifyConnection: () => Promise<void>; 
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
  
  const [howlInstance, setHowlInstance] = useState<Howl | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [activeSpotifyDeviceId, setActiveSpotifyDeviceId] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNextRefCallback = useRef<() => Promise<void>>(async () => {});

  const checkSpotifyConnection = useCallback(async () => {
    const connected = await checkAndSetupToken(); 
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
          setActiveSpotifyDeviceId(null); 
        }
      } catch (err) {
        console.error("Error in checkSpotifyConnection during getMyDevices:", err);
        setIsSpotifyConnected(false); 
        setActiveSpotifyDeviceId(null);
      }
    } else {
      setActiveSpotifyDeviceId(null);
    }
  }, [setIsSpotifyConnected, setActiveSpotifyDeviceId]);


  const syncWithSpotifyPlayback = useCallback(async (isControlAction = false) => {
    if (!isSpotifyConnected || !spotifyApi.getAccessToken()) {
      if (isSpotifyConnected) await checkSpotifyConnection();
      if (!spotifyApi.getAccessToken()) return; 
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
        if (currentTrack?.isSpotifyTrack) {
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
            setVolume(newVolume); 
            if (newVolume === 0 && !isMuted) setIsMuted(true);
            else if (newVolume > 0 && isMuted) setIsMuted(false);
        }
      }
      
      if (spotifyState.is_playing && howlInstance && howlInstance.playing()) {
        howlInstance.pause();
      }
    } else {
        console.log("syncWithSpotifyPlayback: getCurrentPlaybackState returned null. Re-checking connection.");
        await checkSpotifyConnection(); 
    }
  }, [isSpotifyConnected, howlInstance, currentTrack, activeSpotifyDeviceId, isMuted, checkSpotifyConnection, setCurrentTrack, setIsPlaying, setPlaybackProgress, setShuffle, setRepeatMode, setVolume, setIsMuted, setActiveSpotifyDeviceId]);


  const playTrack = useCallback(async (track: Track, playFromQueue: boolean = false, index?: number) => {
    if (howlInstance) { // Stop and unload any existing Howl instance
        howlInstance.stop();
        howlInstance.unload();
        setHowlInstance(null);
    }

    if (track.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId && track.spotifyUri) {
      const result = await spotifyPlay({ uris: [track.spotifyUri], device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { 
        setIsSpotifyConnected(false); 
        console.warn("Spotify play failed, token might be invalid. Marked as disconnected.");
        return;
      }
      setCurrentTrack(track);
      setIsPlaying(true);
      if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
      setTimeout(() => syncWithSpotifyPlayback(true), 500); 
    } else if (track.audioSrc) {
      if (currentTrack?.isSpotifyTrack && isPlaying) { 
          await spotifyPause({device_id: activeSpotifyDeviceId || undefined });
      }
      const newHowl = new Howl({
        src: [track.audioSrc],
        html5: true,
        volume: isMuted ? 0 : volume,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onend: () => {
          // setIsPlaying(false); // onstop should cover this
          playNextRefCallback.current();
        },
        onseek: () => {
            if (currentTrack && currentTrack.duration > 0) {
                const seekTime = newHowl.seek();
                if (typeof seekTime === 'number') {
                    setPlaybackProgress(seekTime / currentTrack.duration);
                }
            }
        },
        onloaderror: (id, err) => {
            console.error("Howler load error:", id, err, track.audioSrc);
            setIsPlaying(false);
            setHowlInstance(null);
        },
        onplayerror: (id, err) => {
            console.error("Howler play error:", id, err);
            setIsPlaying(false);
            if (newHowl) newHowl.unload();
            setHowlInstance(null);
        },
      });
      newHowl.play();
      setHowlInstance(newHowl);
      setCurrentTrack(track);
      if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
    } else if (!track.audioSrc && !track.isSpotifyTrack) {
        if (currentTrack?.isSpotifyTrack && isPlaying) { 
             await spotifyPause({device_id: activeSpotifyDeviceId || undefined });
        }
        setCurrentTrack(track);
        setIsPlaying(true); 
        if (playFromQueue && index !== undefined) setCurrentQueueIndex(index);
        console.log("Track has no audioSrc and is not a Spotify track. Conceptually playing:", track.title);
    }
  }, [isSpotifyConnected, activeSpotifyDeviceId, syncWithSpotifyPlayback, currentTrack, isPlaying, howlInstance, isMuted, volume, setCurrentTrack, setIsPlaying, setCurrentQueueIndex, setIsSpotifyConnected, setHowlInstance]);

  const togglePlayPause = useCallback(async () => {
    if (!currentTrack) {
      if (queue.length > 0) await playTrack(queue[0], true, 0);
      return;
    }
    if (currentTrack.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      let result;
      if (isPlaying) result = await spotifyPause({ device_id: activeSpotifyDeviceId });
      else result = await spotifyPlay({ device_id: activeSpotifyDeviceId }); 
      
      if (result === null && !spotifyApi.getAccessToken()) { 
        setIsSpotifyConnected(false);
        return;
      }
      setIsPlaying(!isPlaying); 
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else if (howlInstance) {
      if (howlInstance.playing()) howlInstance.pause();
      else howlInstance.play();
      // isPlaying state will be updated by Howl's onplay/onpause callbacks
    }
  }, [currentTrack, isPlaying, queue, playTrack, isSpotifyConnected, activeSpotifyDeviceId, howlInstance, syncWithSpotifyPlayback, setIsPlaying, setIsSpotifyConnected]);

  const playNext = useCallback(async () => {
    if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySkipNext({ device_id: activeSpotifyDeviceId });
       if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else { 
      if (howlInstance) {
        howlInstance.stop();
        howlInstance.unload();
        setHowlInstance(null);
      }
      if (queue.length === 0) return;
      let nextIndex = currentQueueIndex + 1;
      if (repeatMode === 'one' && currentTrack && isPlaying && howlInstance) {
        // This state (isPlaying && howlInstance exists for currentTrack) might be rare if onend already fired.
        // Re-trigger playTrack for the same track.
        await playTrack(currentTrack, true, currentQueueIndex);
        return;
      } else if (repeatMode === 'one' && currentTrack && howlInstance) { // If paused but repeat one
        await playTrack(currentTrack, true, currentQueueIndex);
        return;
      }

      if (nextIndex >= queue.length) {
        if (repeatMode === 'all' || repeatMode === 'context') nextIndex = 0;
        else { setIsPlaying(false); return; }
      }
      if (queue[nextIndex]) await playTrack(queue[nextIndex], true, nextIndex);
    }
  }, [currentTrack, queue, currentQueueIndex, repeatMode, isPlaying, playTrack, isSpotifyConnected, activeSpotifyDeviceId, howlInstance, syncWithSpotifyPlayback, setIsPlaying, setIsSpotifyConnected, setHowlInstance]);

  const playPrevious = useCallback(async () => {
     if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySkipPrev({ device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setTimeout(() => syncWithSpotifyPlayback(true), 500);
    } else { 
      if (howlInstance && currentTrack && typeof howlInstance.seek() === 'number' && (howlInstance.seek() as number) > 3) {
        howlInstance.seek(0);
        return; // Stay on current track, just rewind
      }

      if (howlInstance) { 
        howlInstance.stop();
        howlInstance.unload();
        setHowlInstance(null);
      }

      let prevIndex = currentQueueIndex - 1;
      if (prevIndex < 0) {
        if (repeatMode === 'all' || repeatMode === 'context') {
            prevIndex = queue.length - 1;
        } else {
            if (queue.length > 0 && currentQueueIndex === 0) {
                 await playTrack(queue[0], true, 0); 
            } else {
                 setIsPlaying(false); 
            }
            return;
        }
      }
      if (queue[prevIndex]) {
        await playTrack(queue[prevIndex], true, prevIndex);
      }
    }
  }, [currentTrack, isPlaying, queue, currentQueueIndex, repeatMode, playTrack, isSpotifyConnected, activeSpotifyDeviceId, howlInstance, syncWithSpotifyPlayback, setIsPlaying, setIsSpotifyConnected, setHowlInstance]);
  
  const seek = useCallback(async (progress: number) => {
    if (currentTrack?.isSpotifyTrack && isSpotifyConnected && activeSpotifyDeviceId && currentTrack.duration > 0) {
      const result = await spotifySeek(Math.round(progress * currentTrack.duration * 1000), { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); return; }
      setPlaybackProgress(progress); 
      setTimeout(() => syncWithSpotifyPlayback(true), 500); 
    } else if (howlInstance && currentTrack && currentTrack.duration > 0) {
      howlInstance.seek(progress * currentTrack.duration);
      // Playback progress updated by onseek or rAF loop
    }
  }, [currentTrack, isSpotifyConnected, activeSpotifyDeviceId, howlInstance, syncWithSpotifyPlayback, setPlaybackProgress, setIsSpotifyConnected]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    if (isSpotifyConnected && activeSpotifyDeviceId) {
      const result = await spotifySetVolume(Math.round(newVolume * 100), { device_id: activeSpotifyDeviceId });
      if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); }
    } else if (howlInstance) {
      howlInstance.volume(newVolume);
    }
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setLastVolume(newVolume); 
  }, [isSpotifyConnected, activeSpotifyDeviceId, howlInstance, isMuted, setVolume, setLastVolume, setIsSpotifyConnected]); 

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
         if (result === null && !spotifyApi.getAccessToken()) { setIsSpotifyConnected(false); }
    } else if (howlInstance) {
        howlInstance.volume(targetVolume);
    }
    
    if (!newMutedState && volume > 0) setLastVolume(volume); 
    else if (newMutedState && volume > 0) setLastVolume(volume); 
    else if (newMutedState && volume === 0) setLastVolume(0.75); 

    setVolume(targetVolume); 
  }, [isMuted, volume, lastVolume, isSpotifyConnected, activeSpotifyDeviceId, howlInstance, setVolume, setLastVolume, setIsSpotifyConnected]); 
  
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
    // Cleanup function for Howl instance
    return () => {
      if (howlInstance) {
        howlInstance.stop();
        howlInstance.unload();
        setHowlInstance(null); 
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [howlInstance, setHowlInstance]); 

  useEffect(() => {
    const updateHowlerProgress = () => {
      if (howlInstance && howlInstance.playing() && currentTrack && currentTrack.duration > 0 && !currentTrack.isSpotifyTrack) {
        const seekTime = howlInstance.seek();
        if (typeof seekTime === 'number') { 
          setPlaybackProgress(seekTime / currentTrack.duration);
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateHowlerProgress);
    };

    if (isPlaying && howlInstance && !currentTrack?.isSpotifyTrack) {
      animationFrameRef.current = requestAnimationFrame(updateHowlerProgress);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, howlInstance, currentTrack, setPlaybackProgress]);


  useEffect(() => {
    checkSpotifyConnection(); 

    const handleAuthError = () => {
      console.log("PlayerContext: Detected Spotify auth error. Updating connection status.");
      setIsSpotifyConnected(false);
      setActiveSpotifyDeviceId(null);
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
      const interval = (isFullScreenPlayerVisible && currentTrack?.isSpotifyTrack) ? 1000 : 50; 
      syncIntervalRef.current = setInterval(() => syncWithSpotifyPlayback(), interval);
    } else {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    }
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [isSpotifyConnected, syncWithSpotifyPlayback, isFullScreenPlayerVisible, currentTrack?.isSpotifyTrack]);


  useEffect(() => {
    if(howlInstance && currentTrack && !currentTrack.isSpotifyTrack) {
      if (isPlaying && !howlInstance.playing()) {
        howlInstance.play();
      } else if (!isPlaying && howlInstance.playing()) {
        howlInstance.pause();
      }
      howlInstance.volume(isMuted ? 0 : volume);
    } else if (howlInstance && (!currentTrack || currentTrack?.isSpotifyTrack)) { 
        if (howlInstance.playing()) howlInstance.stop(); // Stop if playing
        howlInstance.unload(); // Unload if it's not needed for current track type
        setHowlInstance(null);
    }
  }, [isPlaying, currentTrack, howlInstance, volume, isMuted, setHowlInstance]);


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

