'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm }          from 'react-hook-form';
import { zodResolver }      from '@hookform/resolvers/zod';
import { z }                from 'zod';
import { useRouter }        from 'next/navigation';
import { transactionsApi, usersApi, type ApiUserBasic } from '@/lib/api/client';
import { useAccount }       from '@/hooks/useAccount';
import { formatCurrency }   from '@/lib/utils/currency';
import { cn }               from '@/lib/utils/cn';

const schema = z.object({
  toPhone:     z.string().min(7, 'Enter a valid number'),
  amount:      z.number({ invalid_type_error: 'Enter an amount' }).positive('The amount must be greater than 0'),
  description: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;
const QUICK_AMOUNTS = [10_000, 50_000, 100_000, 200_000, 500_000];

export default function SendPage() {
  const router = useRouter();
  const { data: accountData, refetch } = useAccount();
  const balance  = accountData?.stats.balance  ?? 0;
  const currency = accountData?.stats.currency ?? 'COP';

  const [loading, setLoading]     = useState(false);
  const [serverError, setError]   = useState<string | null>(null);
  const [amountRaw, setAmountRaw] = useState('');
  const [foundUser, setFoundUser] = useState<ApiUserBasic | null>(null);
  const [lookingUp, setLookup]    = useState(false);
  const [success, setSuccess]     = useState<{ reference: string; amount: number; toName: string } | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const phone = watch('toPhone');

  // Debounced phone lookup
  useEffect(() => {
    clearTimeout(debounce.current);
    setFoundUser(null);
    const cleaned = phone?.replace(/\D/g, '') ?? '';
    if (cleaned.length >= 7) {
      setLookup(true);
      debounce.current = setTimeout(async () => {
        try {
          const user = await usersApi.findByPhone(phone.replace(/\s/g, ''));
          setFoundUser(user);
        } catch {
          setFoundUser(null);
        } finally {
          setLookup(false);
        }
      }, 600);
    }
    return () => clearTimeout(debounce.current);
  }, [phone]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      const tx = await transactionsApi.send({
        toPhone:     data.toPhone.replace(/\s/g, ''),
        amount:      data.amount,
        description: data.description,
      });
      await refetch();
      setSuccess({ reference: tx.reference, amount: Number(tx.amount), toName: tx.toAccount?.user?.name ?? 'Recipient' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error sending');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center text-center gap-6 py-12 animate-slide-up">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-mint-500/15 border border-mint-500/30 flex items-center justify-center"
            style={{ animation: 'glowPulse 2s ease-in-out infinite' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3df5b0" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-mint-400 flex items-center justify-center text-night-900 text-xs font-bold">✓</div>
        </div>

        <div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Successful transfer!</h2>
          <p className="text-white/40 text-sm">
            You sent <span className="text-white font-semibold">{formatCurrency(success.amount, currency)}</span> to{' '}
            <span className="text-white font-semibold">{success.toName}</span>
          </p>
        </div>

        <div className="w-full card p-5 space-y-3 text-left">
          {[
            { label: 'Reference', value: success.reference, mono: true, color: 'text-mint-400' },
            { label: 'Amount',      value: formatCurrency(success.amount, currency), mono: true, color: 'text-white' },
            { label: 'Status',     value: '✓ Completed', mono: false, color: 'text-mint-400' },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-white/35">{item.label}</span>
              <span className={cn(item.mono && 'font-mono', 'font-bold', item.color)}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={() => { setSuccess(null); setAmountRaw(''); }} className="btn-ghost flex-1">
            New transfer
          </button>
          <button onClick={() => router.push('/dashboard')} className="btn-primary flex-1">
            Go home
          </button>
        </div>

        <style>{`@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(61,245,176,.2)}50%{box-shadow:0 0 40px rgba(61,245,176,.5)}}`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">Send money</h1>
        <p className="text-white/35 text-sm mt-0.5">Transfer instantly by mobile number</p>
      </div>

      <div className="card p-6 space-y-5">

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[.5px] mb-2">
            Recipient's number
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <input {...register('toPhone')} placeholder="+57 300 000 0000" className="input-field pl-10 pr-10" />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {lookingUp && (
                <div className="w-4 h-4 border-2 border-mint-500/30 border-t-mint-500 rounded-full"
                  style={{ animation: 'spin .8s linear infinite' }} />
              )}
              {!lookingUp && foundUser && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3df5b0" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          </div>
          {errors.toPhone && <p className="text-danger text-xs mt-1.5">{errors.toPhone.message}</p>}

          {/* Found user chip */}
          {foundUser && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-mint-400/8 border border-mint-400/15 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-mint-400/15 flex items-center justify-center text-xs font-bold text-mint-400">
                {foundUser.name.split(' ').slice(0,2).map(w => w[0]).join('')}
              </div>
              <div>
                <p className="text-mint-400 text-xs font-semibold">{foundUser.name}</p>
                <p className="text-mint-400/50 text-[10px]">User found</p>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[.5px] mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-mono font-bold text-lg">$</span>
            <input
              value={amountRaw ? Number(amountRaw).toLocaleString('es-CO') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setAmountRaw(raw);
                setValue('amount', raw ? Number(raw) : 0);
              }}
              placeholder="0"
              className="input-field pl-8 text-xl font-mono font-bold"
            />
          </div>
          {errors.amount && <p className="text-danger text-xs mt-1.5">{errors.amount.message}</p>}

          {/* Quick amounts */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {QUICK_AMOUNTS.map((v) => (
              <button key={v} type="button"
                onClick={() => { setAmountRaw(v.toString()); setValue('amount', v); }}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                  Number(amountRaw) === v
                    ? 'bg-mint-400/15 border-mint-400/30 text-mint-400'
                    : 'bg-white/4 border-border text-white/40 hover:text-white/70 hover:border-white/20'
                )}>
                {v >= 1_000_000 ? `${v/1_000_000}M` : `${v/1_000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[.5px] mb-2">
            Description <span className="normal-case text-white/20">(optional)</span>
          </label>
          <input {...register('description')} placeholder="Fee payment, gift..." className="input-field" />
        </div>

        {/* Balance info */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-night-950/60 border border-border">
          <span className="text-xs text-white/35">Available balance</span>
          <span className="font-mono font-bold text-sm text-mint-400">{formatCurrency(balance, currency)}</span>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/8 border border-danger/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p className="text-danger text-xs">{serverError}</p>
          </div>
        )}

        <button onClick={handleSubmit(onSubmit)} disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full"
              style={{ animation: 'spin .8s linear infinite' }} />Processing...</>
          ) : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>Send transfer</>
          )}
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
