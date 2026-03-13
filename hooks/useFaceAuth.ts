'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type FaceAuthState =
  | 'idle'
  | 'loading-models'
  | 'ready'
  | 'scanning'
  | 'detected'
  | 'capturing'
  | 'success'
  | 'error';

interface UseFaceAuthReturn {
  state: FaceAuthState;
  error: string | null;
  descriptor: number[] | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureDescriptor: () => Promise<number[] | null>;
  reset: () => void;
}

export function useFaceAuth(): UseFaceAuthReturn {
  const [state, setState]           = useState<FaceAuthState>('idle');
  const [error, setError]           = useState<string | null>(null);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const loadModels = useCallback(async () => {
    setState('loading-models');
    try {
      const { loadFaceModels } = await import('@/lib/auth/face-recognition');
      await loadFaceModels();
      setState('ready');
    } catch {
      setError('No se pudieron cargar los modelos de reconocimiento facial.');
      setState('error');
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      // Load models first if needed
      if (state === 'idle') await loadModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setState('scanning');
        startDetectionLoop();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera permission denied. Enable it in your browser.');
      } else {
        setError('Could not access camera.');
      }
      setState('error');
    }
  }, [state, loadModels]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const startDetectionLoop = useCallback(() => {
    const detect = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      if (videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const { drawFaceDetection } = await import('@/lib/auth/face-recognition');
        const detected = await drawFaceDetection(videoRef.current, canvasRef.current);
        setState(prev =>
          prev === 'scanning' || prev === 'detected'
            ? detected ? 'detected' : 'scanning'
            : prev
        );
      } catch {
        // Silent fail in loop
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
  }, []);

  const captureDescriptor = useCallback(async (): Promise<number[] | null> => {
    if (!videoRef.current) return null;

    setState('capturing');
    try {
      const { getFaceDescriptor } = await import('@/lib/auth/face-recognition');
      const desc = await getFaceDescriptor(videoRef.current);

      if (!desc) {
        setError('No se detectó un rostro claro. Asegúrate de estar bien iluminado.');
        setState('detected');
        return null;
      }

      setDescriptor(desc);
      setState('success');
      stopCamera();
      return desc;
    } catch {
      setError('Error capturing face. Try again.');
      setState('error');
      return null;
    }
  }, [stopCamera]);

  const reset = useCallback(() => {
    stopCamera();
    setState('idle');
    setError(null);
    setDescriptor(null);
  }, [stopCamera]);

  return {
    state,
    error,
    descriptor,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureDescriptor,
    reset,
  };
}
