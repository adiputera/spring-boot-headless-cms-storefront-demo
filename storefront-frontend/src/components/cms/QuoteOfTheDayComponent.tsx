import type { QuoteOfTheDayComponent as QuoteOfTheDayComponentType } from '@/types';

export default function QuoteOfTheDayComponent({
  title,
  quote,
}: QuoteOfTheDayComponentType) {
  return (
    <div className="my-8 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-slate-50 to-zinc-100 p-8 rounded-2xl border border-slate-200/60 shadow-xs relative overflow-hidden">
        {/* Subtle decorative quote marks */}
        <div className="absolute top-4 left-6 text-slate-200/80 text-7xl font-serif select-none pointer-events-none leading-none">
          &ldquo;
        </div>
        
        <div className="relative z-10">
          {title && (
            <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              {title}
            </h3>
          )}
          <blockquote className="text-lg md:text-xl italic font-medium text-slate-800 pl-4 border-l-4 border-indigo-500 leading-relaxed">
            {quote}
          </blockquote>
        </div>
        
        <div className="absolute bottom-2 right-6 text-slate-200/80 text-7xl font-serif select-none pointer-events-none leading-none">
          &rdquo;
        </div>
      </div>
    </div>
  );
}
