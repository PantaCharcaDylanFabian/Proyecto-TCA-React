import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, operationKey } from '../lib/api';

export function useResource<T>(loader: () => Promise<T>, resourceKey = '') {
  const loaderRef = useRef(loader);
  useEffect(() => { loaderRef.current = loader; });
  const generation = useRef(0);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invalidate = useCallback(() => { generation.current++; }, []);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setError('');
    try { const next = await loaderRef.current(); if (request === generation.current) setData(next); }
    catch (e) { if (request === generation.current) setError(errorMessage(e)); }
    finally { if (request === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { invalidate(); window.clearTimeout(timer); window.removeEventListener('focus', focus); };
  }, [refresh, resourceKey, invalidate]);
  return { data, loading, error, refresh };
}

export function useAction(refresh?: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const pending = useRef(new Map<string, string>());
  const lock = useRef(false);
  const run = async (signature: string, action: (key: string) => Promise<unknown>, success = 'Operación completada.') => {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError(''); setMessage('');
    const key = pending.current.get(signature) ?? operationKey();
    pending.current.set(signature, key);
    try {
      await action(key);
      pending.current.delete(signature); setMessage(success);
      if (refresh) await refresh();
      return true;
    } catch (e) { setError(errorMessage(e)); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  return { busy, error, message, run, setError };
}
