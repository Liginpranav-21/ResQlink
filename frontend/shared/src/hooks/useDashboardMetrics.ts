import { useState, useEffect } from 'react';
import { emergencyService } from '../services/emergencyService';
import { dashboardService } from '../services/dashboardService';
import type { SharedDataState } from '../types';

export interface DashboardMetrics {
  activeCount: number;
  droneCount: number;
  hospitalCount: number;
  resolvedCount: number;
}

export function useDashboardMetrics(): SharedDataState<DashboardMetrics> {
  const [state, setState] = useState<SharedDataState<DashboardMetrics>>({
    data: { activeCount: 0, droneCount: 0, hospitalCount: 0, resolvedCount: 0 },
    isLoading: true,
    error: null,
    isEmpty: false,
    isSuccess: false,
  });

  useEffect(() => {
    let active = true;
    let emergenciesUnsub = () => {};
    let hospitalsUnsub = () => {};
    let dronesUnsub = () => {};

    try {
      let activeSOS = 0;
      let resolvedCount = 0;
      let openHospitals = 0;
      let onlineDrones = 0;

      const checkState = () => {
        if (!active) return;
        const total = activeSOS + resolvedCount + openHospitals + onlineDrones;
        setState({
          data: {
            activeCount: activeSOS,
            droneCount: onlineDrones,
            hospitalCount: openHospitals,
            resolvedCount: resolvedCount,
          },
          isLoading: false,
          error: null,
          isEmpty: total === 0,
          isSuccess: true,
        });
      };

      emergenciesUnsub = emergencyService.subscribeToEmergencies((list) => {
        activeSOS = list.filter((e) => e.status === 'active' || e.status === 'assigned').length;
        resolvedCount = list.filter((e) => e.status === 'resolved').length;
        checkState();
      });

      hospitalsUnsub = dashboardService.subscribeToHospitals((list) => {
        openHospitals = list.filter((h) => h.isOpen).length;
        checkState();
      });

      dronesUnsub = dashboardService.subscribeToDrones((list) => {
        // Drones in dashboardService listen to drone_logs
        onlineDrones = list.filter((d) => d.status !== 'standby').length;
        checkState();
      });

    } catch (err: any) {
      if (active) {
        setState((prev: SharedDataState<DashboardMetrics>) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to fetch metrics',
          isSuccess: false,
        }));
      }
    }

    return () => {
      active = false;
      emergenciesUnsub();
      hospitalsUnsub();
      dronesUnsub();
    };
  }, []);

  return state;
}
