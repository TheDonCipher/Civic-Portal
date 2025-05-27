/**
 * @fileoverview Optimized Subscription Management Hook
 * @description Provides memory-safe real-time subscription management with automatic cleanup
 */

import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  schema?: string;
}

interface SubscriptionOptions {
  enabled?: boolean;
  onUpdate?: (payload: any) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Optimized hook for managing Supabase real-time subscriptions
 * Prevents memory leaks and handles cleanup automatically
 */
export function useOptimizedSubscription(
  config: SubscriptionConfig,
  options: SubscriptionOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);
  const configRef = useRef(config);
  const optionsRef = useRef(options);

  // Update refs when props change
  configRef.current = config;
  optionsRef.current = options;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        console.log(`🧹 Cleaning up subscription: ${configRef.current.channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      } catch (error) {
        console.error('Error during subscription cleanup:', error);
      }
    }
  }, []);

  const setupSubscription = useCallback(async () => {
    if (!optionsRef.current.enabled) return;

    try {
      // Cleanup existing subscription
      cleanup();

      if (!isMountedRef.current) return;

      const { channelName, table, event = '*', filter, schema = 'public' } = configRef.current;

      console.log(`🔄 Setting up subscription: ${channelName}`);

      const channel = supabase.channel(channelName);

      // Configure postgres changes listener
      const changeConfig: any = {
        event,
        schema,
        table,
      };

      if (filter) {
        changeConfig.filter = filter;
      }

      channel.on('postgres_changes', changeConfig, (payload) => {
        if (!isMountedRef.current) return;

        try {
          optionsRef.current.onUpdate?.(payload);
        } catch (error) {
          console.error('Error in subscription callback:', error);
          optionsRef.current.onError?.(error as Error);
        }
      });

      // Subscribe with status monitoring
      channel.subscribe((status, err) => {
        if (!isMountedRef.current) return;

        if (err) {
          console.error(`❌ Subscription error for ${channelName}:`, err);
          optionsRef.current.onError?.(new Error(`Subscription failed: ${err.message}`));
        } else {
          console.log(`📡 Subscription status for ${channelName}:`, status);
          optionsRef.current.onStatusChange?.(status);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      optionsRef.current.onError?.(error as Error);
    }
  }, [cleanup]);

  // Set up subscription when config or options change
  useEffect(() => {
    if (options.enabled !== false) {
      setupSubscription();
    } else {
      cleanup();
    }
  }, [
    config.channelName,
    config.table,
    config.event,
    config.filter,
    config.schema,
    options.enabled,
    setupSubscription,
    cleanup
  ]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected: channelRef.current !== null,
    reconnect: setupSubscription,
    disconnect: cleanup,
  };
}

/**
 * Hook for managing multiple subscriptions efficiently
 */
export function useMultipleSubscriptions(
  subscriptions: Array<{
    config: SubscriptionConfig;
    options?: SubscriptionOptions;
  }>
) {
  const activeSubscriptions = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Clean up all existing subscriptions
    activeSubscriptions.current.forEach((cleanup) => cleanup());
    activeSubscriptions.current.clear();

    // Set up new subscriptions
    subscriptions.forEach(({ config, options = {} }) => {
      if (options.enabled !== false) {
        const { disconnect } = useOptimizedSubscription(config, options);
        activeSubscriptions.current.set(config.channelName, disconnect);
      }
    });

    // Cleanup on unmount or dependency change
    return () => {
      activeSubscriptions.current.forEach((cleanup) => cleanup());
      activeSubscriptions.current.clear();
    };
  }, [subscriptions]);

  return {
    activeCount: activeSubscriptions.current.size,
    disconnectAll: () => {
      activeSubscriptions.current.forEach((cleanup) => cleanup());
      activeSubscriptions.current.clear();
    },
  };
}

/**
 * Debounced subscription hook to prevent excessive updates
 */
export function useDebouncedSubscription(
  config: SubscriptionConfig,
  options: SubscriptionOptions & { debounceMs?: number } = {}
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { debounceMs = 300, onUpdate, ...restOptions } = options;

  const debouncedOnUpdate = useCallback((payload: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onUpdate?.(payload);
    }, debounceMs);
  }, [onUpdate, debounceMs]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useOptimizedSubscription(config, {
    ...restOptions,
    onUpdate: debouncedOnUpdate,
  });
}

export default useOptimizedSubscription;
