'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchThread } from '../../core/appview';
import type { Thread, UseThreadOptions, UseThreadResult } from '../../core/types';

interface InternalState {
  status: 'idle' | 'loading' | 'success' | 'error';
  thread: Thread | undefined;
  error: Error | undefined;
}

const IDLE: InternalState = { status: 'idle', thread: undefined, error: undefined };
const LOADING: InternalState = { status: 'loading', thread: undefined, error: undefined };

export function useThread(postUri: string, options: UseThreadOptions = {}): UseThreadResult {
  const { depth, appviewUrl, refetchInterval = 0, enabled = true } = options;
  const [state, setState] = useState<InternalState>(IDLE);
  const abortRef = useRef<AbortController | null>(null);
  const tickRef = useRef(0);

  const run = useCallback(() => {
    if (!enabled || !postUri) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const tick = ++tickRef.current;
    setState(LOADING);

    fetchThread(postUri, { depth, appviewUrl, signal: controller.signal })
      .then(thread => {
        if (tick !== tickRef.current) return;
        setState({ status: 'success', thread, error: undefined });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (tick !== tickRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', thread: undefined, error });
      });
  }, [postUri, depth, appviewUrl, enabled]);

  useEffect(() => {
    if (!enabled || !postUri) {
      setState(IDLE);
      return undefined;
    }
    run();
    return () => {
      abortRef.current?.abort();
    };
  }, [run, enabled, postUri]);

  useEffect(() => {
    if (!enabled || refetchInterval <= 0) return undefined;
    const id = setInterval(run, refetchInterval);
    return () => clearInterval(id);
  }, [run, refetchInterval, enabled]);

  // Cast through the discriminated union: each branch is narrowed by `status`.
  if (state.status === 'success' && state.thread) {
    return { status: 'success', thread: state.thread, error: undefined, refetch: run };
  }
  if (state.status === 'error' && state.error) {
    return { status: 'error', thread: undefined, error: state.error, refetch: run };
  }
  return {
    status: state.status as 'idle' | 'loading',
    thread: undefined,
    error: undefined,
    refetch: run,
  };
}
