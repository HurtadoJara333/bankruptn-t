'use client';

import { useState }       from 'react';
import Link                from 'next/link';
import { useForm }         from 'react-hook-form';
import { zodResolver }     from '@hookform/resolvers/zod';
import { z }               from 'zod';
import { useAuth }         from '@/lib/auth/context';
import FaceCapture         from '@/components/auth/FaceCapture';
import { cn }              from '@/lib/utils/cn';

const schema = z.object({
  phone:    z.string().min(7, 'Ingresa un número válido'),
  password: z.string().min(1, 'Ingresa tu contraseña').optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login }                     = useAuth();
  const [mode, setMode]               = useState<'password' | 'face'>('password');
  const [showPass, setShowPass]       = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const phone = watch('phone');

  const onPasswordSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);
    try {
      await login({ phone: data.phone.replace(/\s/g, ''), password: data.password });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const onFaceCapture = async (descriptor: number[]) => {
    setServerError(null);
    setLoading(true);
    try {
      await login({ phone: phone?.replace(/\s/g, '') ?? '', faceDescriptor: descriptor });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'No se pudo verificar el rostro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">

      {/* Logo */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center text-lg shadow-mint-sm">
            💸
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight">
            bankrupt<span className="text-mint-400">n't</span>
          </span>
        </div>
        <p className="text-white/35 text-sm">Ingresa a tu cuenta</p>
      </div>

      {/* Card */}
      <div className="card p-7 shadow-[0_24px_64px_rgba(0,0,0,.5)] animate-slide-up [animation-delay:50ms]"
        style={{ background: 'rgba(19,19,43,.85)', backdropFilter: 'blur(24px)' }}>

        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-white mb-1">Bienvenido de nuevo</h2>
          <p className="text-white/35 text-sm">Accede con tu número de celular</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-night-950/60 border border-border mb-6">
          {(['password', 'face'] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setServerError(null); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200',
                mode === m
                  ? 'bg-mint-400/15 text-mint-400 border border-mint-400/20'
                  : 'text-white/30 hover:text-white/60'
              )}>
              {m === 'password' ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg> Contraseña</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                </svg> Facial</>
              )}
            </button>
          ))}
        </div>

        {/* Phone field (always visible) */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">
            Número de celular
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <input {...register('phone')} placeholder="+57 300 000 0000" className="input-field pl-10" />
          </div>
          {errors.phone && <p className="text-danger text-xs mt-1.5">{errors.phone.message}</p>}
        </div>

        {/* Password mode */}
        {mode === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/8 border border-danger/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <p className="text-danger text-xs">{serverError}</p>
              </div>
            )}

            <button onClick={handleSubmit(onPasswordSubmit)} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full"
                  style={{ animation: 'spin .8s linear infinite' }} />Ingresando...</>
              ) : 'Ingresar'}
            </button>
          </div>
        )}

        {/* Face mode */}
        {mode === 'face' && (
          <div className="space-y-4">
            <FaceCapture mode="login" onCapture={onFaceCapture} onError={setServerError} />
            {serverError && (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/8 border border-danger/20">
                <p className="text-danger text-xs">{serverError}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-center mt-6 text-sm text-white/30">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-mint-400 font-semibold hover:text-mint-300 transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
