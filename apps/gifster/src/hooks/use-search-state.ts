import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from './use-debounced-value';

export type Tab = 'gifs' | 'stickers' | 'favorites';

const readUrlState = (): { q: string; tab: Tab } => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  return {
    q: params.get('q') ?? '',
    tab: tab === 'stickers' || tab === 'favorites' ? tab : 'gifs',
  };
};

/**
 * Search input + committed query + active tab, mirrored to the URL
 * (?q=&tab=) so app state is shareable and back/forward restore it.
 * Typing settles into a live query after a debounce; commit is immediate.
 */
export const useSearchState = () => {
  const initial = useMemo(readUrlState, []);
  const [input, setInput] = useState(initial.q);
  const [query, setQuery] = useState(initial.q);
  const [tab, setTab] = useState<Tab>(initial.tab);

  const debouncedInput = useDebouncedValue(input, 400);
  useEffect(() => setQuery(debouncedInput.trim()), [debouncedInput]);

  const commitSearch = useCallback((term: string) => {
    setInput(term);
    setQuery(term.trim());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tab !== 'gifs') params.set('tab', tab);
    const search = params.toString();
    const next = `${window.location.pathname}${search ? `?${search}` : ''}`;
    if (next !== `${window.location.pathname}${window.location.search}`)
      window.history.replaceState(null, '', next);
  }, [query, tab]);

  useEffect(() => {
    const onPopState = () => {
      const state = readUrlState();
      setInput(state.q);
      setQuery(state.q);
      setTab(state.tab);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return { input, setInput, query, tab, setTab, commitSearch };
};
