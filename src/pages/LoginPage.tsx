import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

export function LoginPage() {
  const { signIn, signUp, authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = mode === 'login' ? await signIn(email, password) : await signUp(name, email, password);
    if (!result.error && mode === 'signup') setMessage('Account created. You can now enter the secure workspace.');
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-[#07121f] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(14,116,144,0.2),transparent_32%)]" />
          <div className="relative"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-slate-950"><ShieldCheck size={25} /></div><span className="text-sm font-bold tracking-[0.25em]">SAFEHABITAT AI</span></div></div>
          <div className="relative max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Proactive risk intelligence</div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white">Move from disaster response to safer decisions.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">A decision-support workspace for multi-hazard risk, vulnerable habitations, and relocation planning.</p>
            <div className="mt-12 grid grid-cols-3 gap-3 text-xs"><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-2xl font-semibold text-white">32</p><p className="mt-1 text-slate-500">demo habitations</p></div><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-2xl font-semibold text-white">4</p><p className="mt-1 text-slate-500">hazard layers</p></div><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="text-2xl font-semibold text-white">8</p><p className="mt-1 text-slate-500">safe sites</p></div></div>
          </div>
          <p className="relative text-xs text-slate-600">Prototype methodology · Not an official government standard</p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950"><ShieldCheck size={22} /></div><span className="text-sm font-bold tracking-[0.2em]">SAFEHABITAT AI</span></div></div>
            <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Secure authority access</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{mode === 'login' ? 'Sign in to review the current regional risk picture.' : 'New accounts begin with viewer access and can be elevated by an administrator.'}</p></div>
            <form onSubmit={submit} className="space-y-5">
              {mode === 'signup' && <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Full name</span><div className="relative"><UserRound className="absolute left-3 top-3.5 text-slate-500" size={17} /><input required value={name} onChange={(event) => setName(event.target.value)} className="field pl-10" placeholder="Your full name" /></div></label>}
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Email address</span><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-500" size={17} /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field pl-10" placeholder="officer@agency.gov" /></div></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 text-slate-500" size={17} /><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="field px-10" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-3 text-slate-500 transition hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              {(authError || message) && <div className={`rounded-xl border px-4 py-3 text-sm ${authError ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{authError ?? message}</div>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">{busy ? 'Securing access…' : mode === 'login' ? 'Enter secure workspace' : 'Create account'} {!busy && <ArrowRight size={17} />}</button>
            </form>
            <button onClick={() => { setMode((current) => current === 'login' ? 'signup' : 'login'); setMessage(null); }} className="mt-6 w-full text-center text-sm text-slate-400 transition hover:text-white">{mode === 'login' ? 'Need an account? Create viewer access' : 'Already registered? Sign in instead'}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
