'use client';

import { useState }       from 'react';
import { useAccount }     from '@/hooks/useAccount';
import { formatCurrency, maskAccountNumber } from '@/lib/utils/currency';
import { cn }             from '@/lib/utils/cn';
import QRCode             from 'qrcode.react';

export default function ReceivePage() {
  const { data, refetch }           = useAccount();
  const [copied, setCopied]         = useState<'phone' | 'account' | null>(null);
  const [depositAmt, setDepositAmt] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);

  const account  = data?.account;
  const balance  = data?.stats.balance  ?? 0;
  const currency = data?.stats.currency ?? 'COP';
  const phone    = account?.user?.phone ?? '';

  const qrPayload = account
    ? JSON.stringify({ app: 'bankruptnt', account: account.accountNumber })
    : '';

  const copyToClipboard = async (text: string, type: 'phone' | 'account') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmt.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) return;
    setDepositing(true);
    try {
      const token = localStorage.getItem('bankruptnt_token') ?? '';
      const res   = await fetch('/api/account/deposit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ amount, description: 'Recarga de saldo' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await refetch();
      setDepositMsg(`✓ Recargaste ${formatCurrency(amount, currency)} exitosamente`);
      setDepositAmt('');
      setTimeout(() => setDepositMsg(null), 4000);
    } catch (err: unknown) {
      setDepositMsg(err instanceof Error ? err.message : 'Error al procesar la recarga');
    } finally {
      setDepositing(false);
    }
  };

  const copyItems = [
    {
      label: 'Número de celular',
      value: phone,
      type:  'phone' as const,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Número de cuenta',
      value: account?.accountNumber ?? '----------',
      type:  'account' as const,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-slide-up">

      <div>
        <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">Recibir dinero</h1>
        <p className="text-white/35 text-sm mt-0.5">Comparte tu información para recibir transferencias</p>
      </div>

      {/* QR card */}
      <div className="card p-6 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-sm font-semibold text-white/60 mb-1">Código QR de tu cuenta</p>
          <p className="text-xs text-white/25">Muéstralo para que te transfieran</p>
        </div>

        <div className="p-4 bg-white rounded-2xl" style={{ boxShadow: '0 0 30px rgba(61,245,176,.2)' }}>
          {qrPayload ? (
            <QRCode value={qrPayload} size={180} level="M" renderAs="svg" fgColor="#0f0f1a" bgColor="#ffffff" />
          ) : (
            <div className="w-[180px] h-[180px] bg-gray-100 rounded animate-pulse" />
          )}
        </div>

        {account && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-night-950/60 border border-border">
            <span className="font-mono text-sm text-white/50">{maskAccountNumber(account.accountNumber)}</span>
          </div>
        )}
      </div>

      {/* Share data */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-white/[0.02]">
          <p className="text-xs font-bold text-white/30 uppercase tracking-[.6px]">Datos para transferir</p>
        </div>
        {copyItems.map((item) => (
          <div key={item.type} className="flex items-center gap-4 px-5 py-4 border-b border-border/60 last:border-none">
            <div className="w-8 h-8 rounded-xl bg-night-950 border border-border flex items-center justify-center text-white/30">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-[.4px] mb-0.5">{item.label}</p>
              <p className="font-mono text-sm text-white font-semibold">{item.value}</p>
            </div>
            <button
              onClick={() => copyToClipboard(item.value, item.type)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200',
                copied === item.type
                  ? 'bg-mint-400/15 border-mint-400/30 text-mint-400'
                  : 'border-border text-white/30 hover:text-white hover:border-white/20'
              )}
            >
              {copied === item.type ? (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Copiado</>
              ) : (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Deposit */}
      <div className="card p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-white text-base">Recargar saldo</h3>
          <p className="text-white/30 text-xs mt-0.5">Agrega fondos a tu cuenta</p>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-night-950/60 border border-border">
          <span className="text-xs text-white/35">Saldo actual</span>
          <span className="font-mono font-bold text-sm text-mint-400">{formatCurrency(balance, currency)}</span>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-mono font-bold">$</span>
          <input
            value={depositAmt ? Number(depositAmt).toLocaleString('es-CO') : ''}
            onChange={(e) => setDepositAmt(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Monto a recargar"
            className="input-field pl-8 font-mono"
          />
        </div>

        {depositMsg && (
          <div className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-semibold border',
            depositMsg.startsWith('✓')
              ? 'bg-mint-400/8 border-mint-400/15 text-mint-400'
              : 'bg-danger/8 border-danger/15 text-danger'
          )}>
            {depositMsg}
          </div>
        )}

        <button onClick={handleDeposit} disabled={!depositAmt || depositing}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {depositing ? (
            <><span className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full"
              style={{ animation: 'spin .8s linear infinite' }} />Procesando...</>
          ) : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>Confirmar recarga</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
