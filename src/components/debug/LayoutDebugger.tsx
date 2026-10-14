import React, { useEffect, useState } from 'react';

interface OverflowItem {
  tag: string;
  className: string;
  width: number;
  id?: string;
}

export const LayoutDebugger: React.FC = () => {
  const [active, setActive] = useState(false);
  const [metrics, setMetrics] = useState({
    innerWidth: 0,
    innerHeight: 0,
    dpr: 1,
    scale: 1,
    scrollWidth: 0,
  });
  const [overflows, setOverflows] = useState<OverflowItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDebug = window.location.search.includes('debug=layout');
    setActive(isDebug);
    if (!isDebug) return;

    const inspectLayout = () => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const scale = window.visualViewport?.scale ?? 1;
      const sw = document.documentElement.scrollWidth;

      setMetrics({
        innerWidth: iw,
        innerHeight: ih,
        dpr: Number(dpr.toFixed(2)),
        scale: Number(scale.toFixed(2)),
        scrollWidth: sw,
      });

      // Nettoyer les contours rouges précédents
      document.querySelectorAll('[data-layout-overflow]').forEach((el) => {
        (el as HTMLElement).style.outline = '';
        el.removeAttribute('data-layout-overflow');
      });

      // Rechercher les éléments plus larges que window.innerWidth
      const allElements = Array.from(document.body.querySelectorAll('*'));
      const found: OverflowItem[] = [];

      for (const el of allElements) {
        if (el.closest('#debug-layout-overlay')) continue;
        const rect = el.getBoundingClientRect();
        const elWidth = Math.round(rect.width);

        if (elWidth > iw + 1) {
          (el as HTMLElement).style.outline = '2px solid red';
          el.setAttribute('data-layout-overflow', 'true');

          if (found.length < 5) {
            found.push({
              tag: el.tagName.toLowerCase(),
              className: (typeof el.className === 'string' ? el.className : '').trim().slice(0, 70),
              width: elWidth,
              id: el.id || undefined,
            });
          }
        }
      }

      setOverflows(found);
    };

    inspectLayout();
    const timer = setInterval(inspectLayout, 600);
    window.addEventListener('resize', inspectLayout);
    window.addEventListener('scroll', inspectLayout, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', inspectLayout);
      window.removeEventListener('scroll', inspectLayout);
      document.querySelectorAll('[data-layout-overflow]').forEach((el) => {
        (el as HTMLElement).style.outline = '';
        el.removeAttribute('data-layout-overflow');
      });
    };
  }, []);

  if (!active) return null;

  const hasOverflow = metrics.scrollWidth > metrics.innerWidth;

  return (
    <aside
      id="debug-layout-overlay"
      aria-label="Diagnostic de mise en page"
      className="fixed bottom-2 left-2 right-2 sm:left-auto sm:right-3 sm:w-96 z-[9999] bg-foreground text-background p-3 rounded-2xl shadow-2xl border-2 border-border text-xs font-mono select-none pointer-events-auto backdrop-blur-md"
    >
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border">
        <span className="font-bold text-[11px] uppercase tracking-wider text-lime flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          Debug Layout (?debug=layout)
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          hasOverflow ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {hasOverflow ? `+${metrics.scrollWidth - metrics.innerWidth}px débordement` : 'OK (100% écran)'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-stone-300">
        <div>innerWidth: <strong className="text-white">{metrics.innerWidth}px</strong></div>
        <div>innerHeight: <strong className="text-white">{metrics.innerHeight}px</strong></div>
        <div>scrollWidth: <strong className={hasOverflow ? 'text-rose-400' : 'text-emerald-400'}>{metrics.scrollWidth}px</strong></div>
        <div>DPR: <strong className="text-white">{metrics.dpr}</strong></div>
        <div>viewport scale: <strong className="text-white">{metrics.scale}</strong></div>
      </div>

      {overflows.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          <div className="text-[10px] font-bold text-rose-400 uppercase">
            Éléments coupables ({overflows.length}) - entourés en rouge :
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1 text-[10px]">
            {overflows.map((it, idx) => (
              <div key={idx} className="bg-foreground p-1.5 rounded border border-rose-900/40">
                <span className="text-rose-300 font-bold">&lt;{it.tag}&gt;</span>{' '}
                <span className="text-lime">({it.width}px)</span>
                {it.id && <span className="text-muted-foreground"> #{it.id}</span>}
                {it.className && (
                  <div className="text-muted-foreground truncate text-[9px] mt-0.5">
                    .{it.className.split(' ').slice(0, 4).join('.')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
