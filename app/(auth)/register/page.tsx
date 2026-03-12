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
  name:            z.string().min(2, 'Mínimo 2 caracteres').max(60),
  phone:           z.string().min(7, 'Ingresa un número válido'),
  password:        z.string().min(6, 'Mínimo 6 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (d) => !d.password || d.password === d.confirmPassword,
  { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] }
);

type FormData     = z.infer<typeof schema>;
type AuthMethod   = 'PASSWORD' | 'FACE' | 'BOTH';
type Step         = 'info' | 'method' | 'credentials';

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
        done   && 'bg-mint-500 text-night-900',
        active && !done && 'bg-mint-400/20 border-2 border-mint-400 text-mint-400',
        !active && !done && 'bg-white/5 border border-white/10 text-white/25'
      )}>
        {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          : active ? '●' : '○'}
      </div>
      <span className={cn('text-[10px] font-medium', active || done ? 'text-white/50' : 'text-white/20')}>{label}</span>
    </div>
  );
}

function MethodCard({ id, label, desc, icon, selected, onSelect }: {
  id: AuthMethod; label: string; desc: string; icon: string;
  selected: boolean; onSelect: (id: AuthMethod) => void;
}) {
  return (
    <button type="button" onClick={() => onSelect(id)}
      className={cn(
        'w-full flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
        selected ? 'border-mint-500/50 bg-mint-400/8' : 'border-border bg-night-900/60 hover:border-white/20'
      )}>
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-semibold mb-0.5', selected ? 'text-mint-400' : 'text-white')}>{label}</div>
        <div className="text-xs text-white/35 leading-relaxed">{desc}</div>
      </div>
      <div className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all', selected ? 'border-mint-400 bg-mint-400' : 'border-white/20')}>
        {selected && <div className="w-full h-full flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#070710" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
        </div>}
      </div>
    </button>
  );
}

export default function RegisterPage() {
  const { register: authRegister }    = useAuth();
  const [step, setStep]               = useState<Step>('info');
  const [method, setMethod]           = useState<AuthMethod>('PASSWORD');
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [faceDesc, setFaceDesc]       = useState<number[] | null>(null);
  const [faceError, setFaceError]     = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const stepIndex = { info: 0, method: 1, credentials: 2 }[step];

  const goToMethod = async () => {
    const ok = await trigger(['name', 'phone']);
    if (ok) setStep('method');
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    if ((method === 'FACE' || method === 'BOTH') && !faceDesc) {
      setFaceError('Debes capturar tu rostro primero');
      return;
    }
    setLoading(true);
    try {
      await authRegister({
        phone:          data.phone.replace(/\s/g, ''),
        name:           data.name.trim(),
        authMethod:     method,
        password:       data.password,
        faceDescriptor: faceDesc ?? undefined,
      });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">

      {/* Logo */}
      <div className="text-center mb-8 animate-slide-up">
        <Link href="/login" className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center text-lg shadow-mint-sm">💸</div>
          <span className="text-xl font-display font-extrabold tracking-tight">bankrupt<span className="text-mint-400">n't</span></span>
        </Link>
        <p className="text-white/35 text-sm">Crea tu cuenta gratis</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-6 animate-slide-up [animation-delay:50ms]">
        <StepDot active={step === 'info'}        done={stepIndex > 0} label="Datos"  />
        <div className={cn('flex-1 h-px max-w-[60px] transition-colors', stepIndex > 0 ? 'bg-mint-500/40' : 'bg-white/10')} />
        <StepDot active={step === 'method'}      done={stepIndex > 1} label="Método" />
        <div className={cn('flex-1 h-px max-w-[60px] transition-colors', stepIndex > 1 ? 'bg-mint-500/40' : 'bg-white/10')} />
        <StepDot active={step === 'credentials'} done={false}         label="Listo"  />
      </div>

      {/* Card */}
      <div className="card p-7 shadow-[0_24px_64px_rgba(0,0,0,.5)] animate-slide-up [animation-delay:100ms]"
        style={{ background: 'rgba(19,19,43,.85)', backdropFilter: 'blur(24px)' }}>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Step 1: Info */}
          {step === 'info' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="font-display font-bold text-xl text-white mb-1">Tus datos</h2>
                <p className="text-white/35 text-sm">Empecemos con lo básico</p>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">Nombre completo</label>
                <input {...register('name')} placeholder="Juan Pérez" className="input-field" />
                {errors.name && <p className="text-danger text-xs mt-1.5">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">Número de celular</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input {...register('phone')} placeholder="+57 300 000 0000" className="input-field pl-10" />
                </div>
                {errors.phone && <p className="text-danger text-xs mt-1.5">{errors.phone.message}</p>}
              </div>
              <button type="button" onClick={goToMethod} className="btn-primary w-full flex items-center justify-center gap-2">
                Continuar
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Method */}
          {step === 'method' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="font-display font-bold text-xl text-white mb-1">Método de acceso</h2>
                <p className="text-white/35 text-sm">¿Cómo quieres ingresar?</p>
              </div>
              <div className="space-y-2.5">
                <MethodCard id="PASSWORD" icon="🔑" label="Contraseña"             desc="Ingresa con tu número y una clave secreta."           selected={method === 'PASSWORD'} onSelect={setMethod} />
                <MethodCard id="FACE"     icon="📷" label="Reconocimiento facial"  desc="Accede usando tu rostro. Rápido y seguro."            selected={method === 'FACE'}     onSelect={setMethod} />
                <MethodCard id="BOTH"     icon="🛡️" label="Ambos (recomendado)"   desc="Contraseña + reconocimiento facial. Más seguro."      selected={method === 'BOTH'}     onSelect={setMethod} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep('info')} className="btn-ghost flex-1">Atrás</button>
                <button type="button" onClick={() => setStep('credentials')} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continuar
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 'credentials' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="font-display font-bold text-xl text-white mb-1">
                  {method === 'FACE' ? 'Registra tu rostro' : 'Crea tu contraseña'}
                </h2>
                <p className="text-white/35 text-sm">
                  {method === 'BOTH' ? 'Contraseña y rostro' : method === 'FACE' ? 'Captura tu biometría' : 'Elige una clave segura'}
                </p>
              </div>

              {(method === 'PASSWORD' || method === 'BOTH') && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">Contraseña</label>
                    <div className="relative">
                      <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" className="input-field pr-12" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-[.5px] mb-2">Confirmar contraseña</label>
                    <div className="relative">
                      <input {...register('confirmPassword')} type={showConf ? 'text' : 'password'} placeholder="Repite tu contraseña" className="input-field pr-12" />
                      <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-danger text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                  </div>
                </>
              )}

              {(method === 'FACE' || method === 'BOTH') && (
                <div>
                  {method === 'BOTH' && <div className="flex items-center gap-2 mb-2"><div className="flex-1 h-px bg-white/8"/><span className="text-[11px] text-white/30">Y también tu rostro</span><div className="flex-1 h-px bg-white/8"/></div>}
                  <FaceCapture mode="register" onCapture={(d) => { setFaceDesc(d); setFaceError(null); }} onError={setFaceError} />
                  {faceError && <p className="text-danger text-xs mt-1.5">{faceError}</p>}
                </div>
              )}

              {serverError && (
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/8 border border-danger/20">
                  <p className="text-danger text-xs">{serverError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep('method')} className="btn-ghost flex-1">Atrás</button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full" style={{ animation: 'spin .8s linear infinite' }} />Creando...</>
                  ) : <>Crear cuenta <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></>}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-5 text-sm text-white/30">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-mint-400 font-semibold hover:text-mint-300 transition-colors">Inicia sesión</Link>
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mt-5 text-white/20 text-[11px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Datos cifrados · Biometría local · Sin anuncios
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
