import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { Hospital, SharedDataState } from '../types';

export function useHospitalStatus(): SharedDataState<Hospital[]> {
  const [state, setState] = useState<SharedDataState<Hospital[]>>({
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
      unsub = dashboardService.subscribeToHospitals((list) => {
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
          error: err.message || 'Failed to fetch hospitals',
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
