import { useState, useEffect } from 'react';
import { emergencyService } from '../services/emergencyService';
import type { Emergency, SharedDataState } from '../types';

export function useEmergencyFeed(): SharedDataState<Emergency[]> {
  const [state, setState] = useState<SharedDataState<Emergency[]>>({
    data: [],
    isLoading: true,
    error: null,
    isEmpty: false,
    isSuccess: false,
  });

  useEffect(() => {
    let active = true;
    let unsub = () => {};
    try {
      unsub = emergencyService.subscribeToEmergencies((list) => {
        if (!active) return;
        setState({
          data: list,
          isLoading: false,
          error: null,
          isEmpty: list.length === 0,
          isSuccess: true,
        });
      });
    } catch (err: any) {
      if (active) {
        setState({
          data: [],
          isLoading: false,
          error: err.message || 'Failed to fetch emergencies',
          isEmpty: true,
          isSuccess: false,
        });
      }
    }
    return () => {
      active = false;
      unsub();
    };
  }, []);

  return state;
}
