import { FaArrowTrendUp } from 'react-icons/fa6';
import { cn } from '../lib/cn';

type Props = {
  terms: string[];
  activeTerm: string;
  onSelect: (term: string) => void;
};

/**
 * All pills on screen, wrapping freely — Scott's call: full visibility over
 * the layout shift the late-arriving rows cause. min-h reserves one row.
 */
const TrendingChips = ({ terms, activeTerm, onSelect }: Props) => {
  return (
    <div className='flex min-h-10 w-full max-w-4xl flex-wrap items-center justify-center gap-2'>
      {terms.map((term) => {
        const active = term === activeTerm;
        return (
          <button
            key={term}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-150',
              active
                ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-900/40'
                : 'bg-white/[0.07] text-white/70 ring-1 ring-white/10 hover:bg-white/15 hover:text-white',
            )}
            onClick={() => onSelect(active ? '' : term)}
          >
            <FaArrowTrendUp className='text-xs' />
            {term}
          </button>
        );
      })}
    </div>
  );
};

export { TrendingChips };
