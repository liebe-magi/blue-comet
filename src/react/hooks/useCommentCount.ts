'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchThreadCount } from '../../core/appview';
import type { UseCommentCountOptions, UseCommentCountResult } from '../../core/types';

interface InternalState {
  status: 'idle' | 'loading' | 'success' | 'error';
  count: number | undefined;
  error: Error | undefined;
}

const IDLE: InternalState = { status: 'idle', count: undefined, error: undefined };
const LOADING: InternalState = { status: 'loading', count: undefined, error: undefined };

export function useCommentCount(
  postUri: string,
  options: UseCommentCountOptions = {}
): UseCommentCountResult {
  const { appviewUrl, refetchInterval = 0, enabled = true } = options;
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

    fetchThreadCount(postUri, { appviewUrl, signal: controller.signal })
      .then(count => {
        if (tick !== tickRef.current) return;
        setState({ status: 'success', count, error: undefined });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (tick !== tickRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', count: undefined, error });
      });
  }, [postUri, appviewUrl, enabled]);

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

  if (state.status === 'success' && typeof state.count === 'number') {
    return { status: 'success', count: state.count, error: undefined, refetch: run };
  }
  if (state.status === 'error' && state.error) {
    return { status: 'error', count: undefined, error: state.error, refetch: run };
  }
  return {
    status: state.status as 'idle' | 'loading',
    count: undefined,
    error: undefined,
    refetch: run,
  };
}
