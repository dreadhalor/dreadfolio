import { useEffect, useRef, useState } from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { cn } from '../lib/cn';
import { fetchSearchSuggestions } from '../lib/giphy';
import { useDebouncedValue } from '../hooks/use-debounced-value';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
};

/**
 * Search input with Giphy tag autocomplete. Live-searches as you type
 * (debounced upstream); Enter commits immediately, "/" focuses from anywhere.
 */
const SearchBar = ({ value, onChange, onCommit }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const debouncedValue = useDebouncedValue(value, 250);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.target instanceof HTMLInputElement) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setHighlighted(-1);
    if (!debouncedValue.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetchSearchSuggestions(debouncedValue.trim(), controller.signal)
      .then((tags) =>
        setSuggestions(
          tags.filter(
            (tag) => tag.toLowerCase() !== debouncedValue.trim().toLowerCase(),
          ),
        ),
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, [debouncedValue]);

  const commit = (term: string) => {
    onCommit(term);
    setSuggestions([]);
    setHighlighted(-1);
    inputRef.current?.blur();
  };

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <div className='relative w-full max-w-2xl'>
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 ring-1 ring-white/10',
          'backdrop-blur transition-all duration-200',
          'focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-fuchsia-500/60',
          showSuggestions && 'rounded-b-none',
        )}
      >
        <FaMagnifyingGlass className='shrink-0 text-white/40' />
        <input
          ref={inputRef}
          type='text'
          value={value}
          placeholder='Search millions of GIFs…'
          autoComplete='off'
          spellCheck={false}
          className='h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-white/35'
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit(suggestions[highlighted] ?? value);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlighted((i) => (i + 1) % Math.max(suggestions.length, 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlighted(
                (i) =>
                  (i - 1 + suggestions.length) %
                  Math.max(suggestions.length, 1),
              );
            } else if (e.key === 'Escape') {
              if (suggestions.length) setSuggestions([]);
              else onChange('');
            }
          }}
        />
        {value ? (
          <button
            className='grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white'
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label='Clear search'
          >
            <FaXmark />
          </button>
        ) : (
          <kbd className='hidden shrink-0 rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white/40 sm:block'>
            /
          </kbd>
        )}
      </div>

      {showSuggestions && (
        <div className='absolute inset-x-0 top-full z-30 overflow-hidden rounded-b-2xl bg-[#191922] shadow-2xl ring-1 ring-white/10'>
          {suggestions.map((tag, index) => (
            <button
              key={tag}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80',
                'transition-colors hover:bg-white/10',
                index === highlighted && 'bg-white/10 text-white',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(tag)}
            >
              <FaMagnifyingGlass className='text-xs text-white/30' />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { SearchBar };
