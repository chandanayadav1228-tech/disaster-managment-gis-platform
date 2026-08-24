import { ShieldCheck } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
        <ShieldCheck size={23} strokeWidth={2.4} />
      </div>
      <div>
        <p className="text-sm font-bold tracking-[0.22em] text-white">SAFEHABITAT</p>
        <p className="mt-0.5 text-[10px] font-semibold tracking-[0.3em] text-emerald-300">AI / DECISION SUPPORT</p>
      </div>
    </div>
  );
}
