'use client';

import { useEffect } from 'react';
import { useFaceAuth, type FaceAuthState } from '@/hooks/useFaceAuth';
import { cn } from '@/lib/utils/cn';

interface FaceCaptureProps {
  onCapture: (descriptor: number[]) => void;
  onError?: (msg: string) => void;
  mode?: 'register' | 'login';
  className?: string;
}

const STATE_LABELS: Record<FaceAuthState, string> = {
  'idle':           'Activate camera',
  'loading-models': 'Loading models...',
  'ready':          'Ready',
  'scanning':       'Looking for face...',
  'detected':       'Face detected! Capture',
  'capturing':      'Capturing...',
  'success':        'Capture successful!',
  'error':          'Error',
};

export default function FaceCapture({
  onCapture,
  onError,
  mode = 'register',
  className,
}: FaceCaptureProps) {
  const {
    state, error, videoRef, canvasRef,
    startCamera, captureDescriptor, reset,
  } = useFaceAuth();

  // Forward errors to parent
  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  const handleCapture = async () => {
    const desc = await captureDescriptor();
    if (desc) onCapture(desc);
  };

  const isActive   = ['scanning', 'detected', 'capturing'].includes(state);
  const isDetected = state === 'detected';
  const isSuccess  = state === 'success';
  const isLoading  = state === 'loading-models' || state === 'capturing';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Camera viewport */}
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden bg-night-950 transition-all duration-300',
          'border',
          isDetected && 'border-mint-500/60 shadow-mint-md',
          isSuccess  && 'border-mint-400/80 shadow-mint-lg',
          !isDetected && !isSuccess && 'border-border',
          !isActive && !isSuccess && 'cursor-pointer'
        )}
        style={{ aspectRatio: '4/3' }}
        onClick={!isActive && !isSuccess ? startCamera : undefined}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover scale-x-[-1] transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Canvas overlay for face landmarks */}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Scan line animation */}
        {isActive && (
          <div
            className="absolute inset-x-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #3df5b0, transparent)',
              boxShadow: '0 0 8px #3df5b0',
              animation: 'scanLine 2s linear infinite',
            }}
          />
        )}

        {/* Corner brackets when active */}
        {isActive && (
          <>
            {[
              'top-2 left-2 border-t-2 border-l-2',
              'top-2 right-2 border-t-2 border-r-2',
              'bottom-2 left-2 border-b-2 border-l-2',
              'bottom-2 right-2 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div
                key={i}
                className={cn(
                  'absolute w-5 h-5 transition-colors duration-300',
                  cls,
                  isDetected ? 'border-mint-400' : 'border-white/30'
                )}
              />
            ))}
          </>
        )}

        {/* Idle / success placeholder */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {isSuccess ? (
              <>
                <div className="w-16 h-16 rounded-full bg-mint-500/20 border border-mint-500/40 flex items-center justify-center animate-pulse-mint">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3df5b0" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-mint-400 text-sm font-semibold">Face registered</p>
                <button
                  onClick={reset}
                  className="text-white/30 text-xs hover:text-white/60 transition-colors underline"
                >
                  Capture again
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-night-900 border border-dashed border-border flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-sm">
                    {isLoading ? 'Loading...' : 'Tap to activate camera'}
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    {mode === 'register'
                      ? 'Your face will be stored securely'
                      : 'We will use your face to verify your identity'}
                  </p>
                </div>
                {isLoading && (
                  <div className="w-6 h-6 border-2 border-mint-500/30 border-t-mint-500 rounded-full"
                    style={{ animation: 'spin 0.8s linear infinite' }} />
                )}
              </>
            )}
          </div>
        )}

        {/* Detected pulse ring */}
        {isDetected && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ boxShadow: 'inset 0 0 0 2px rgba(61,245,176,0.4)' }} />
        )}
      </div>

      {/* Status + action */}
      {isActive && (
        <button
          onClick={handleCapture}
          disabled={!isDetected || isLoading}
          className={cn(
            'w-full py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200',
            isDetected
              ? 'bg-mint-500 text-night-900 shadow-mint-sm hover:shadow-mint-md hover:-translate-y-0.5 active:scale-95'
              : 'bg-night-900 text-white/20 border border-border cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-night-700/40 border-t-night-900 rounded-full"
                style={{ animation: 'spin 0.8s linear infinite' }} />
              Capturando...
            </span>
          ) : isDetected ? (
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {STATE_LABELS[state]}
            </span>
          ) : (
            STATE_LABELS[state]
          )}
        </button>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-danger/8 border border-danger/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p className="text-danger text-xs leading-relaxed">{error}</p>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          from { top: -2px; }
          to   { top: calc(100% + 2px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
