import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/lib/api';

type State<T> = { key: string; version: number; data?: T; error: string | null };

/**
 * Carrega dados de forma assíncrona. `deps` identificam a consulta: quando
 * mudam, recarrega. Também recarrega quando a tela volta ao foco (ex.: depois
 * de editar um assistido e voltar para o painel).
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const key = JSON.stringify(deps);
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State<T>>({ key: '', version: -1, error: null });
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => !cancelled && setState({ key, version, data, error: null }),
      (e: unknown) => !cancelled && setState((s) => ({ key, version, data: s.key === key ? s.data : undefined, error: errorMessage(e) })),
    );
    return () => {
      cancelled = true;
    };
  }, [key, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focused.current) reload();
      focused.current = true;
    }, [reload]),
  );

  const setData = useCallback((update: (prev: T | undefined) => T) => {
    setState((s) => ({ ...s, data: update(s.data) }));
  }, []);

  const sameKey = state.key === key;
  return {
    // Mantém os dados anteriores enquanto recarrega a mesma consulta.
    data: sameKey ? state.data : undefined,
    error: sameKey ? state.error : null,
    loading: !sameKey || state.version !== version,
    reload,
    setData,
  };
}
