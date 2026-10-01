import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { commandCenterService } from '../services/commandCenterService';
import type { RescueTeam, FleetUnit, Drone, SharedDataState } from '../types';

export interface FleetStatus {
  rescueTeams: RescueTeam[];
  ambulances: FleetUnit[];
  drones: Drone[];
}

export function useFleetStatus(): SharedDataState<FleetStatus> {
  const [state, setState] = useState<SharedDataState<FleetStatus>>({
    data: { rescueTeams: [], ambulances: [], drones: [] },
    isLoading: true,
    error: null,
    isEmpty: false,
    isSuccess: false,
  });

  useEffect(() => {
    let active = true;
    let teamsUnsub = () => {};
    let ambulancesUnsub = () => {};
    let dronesUnsub = () => {};

    try {
      let rescueTeams: RescueTeam[] = [];
      let ambulances: FleetUnit[] = [];
      let drones: Drone[] = [];

      const checkState = () => {
        if (!active) return;
        const total = rescueTeams.length + ambulances.length + drones.length;
        setState({
          data: { rescueTeams, ambulances, drones },
          isLoading: false,
          error: null,
          isEmpty: total === 0,
          isSuccess: true,
        });
      };

      teamsUnsub = dashboardService.subscribeToRescueTeams((list) => {
        rescueTeams = list;
        checkState();
      });

      ambulancesUnsub = commandCenterService.subscribeToAmbulances((list) => {
        ambulances = list;
        checkState();
      });

      dronesUnsub = dashboardService.subscribeToDrones((list) => {
        drones = list;
        checkState();
      });

    } catch (err: any) {
      if (active) {
        setState((prev: SharedDataState<FleetStatus>) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to fetch fleet status',
          isSuccess: false,
        }));
      }
    }

    return () => {
      active = false;
      teamsUnsub();
      ambulancesUnsub();
      dronesUnsub();
    };
  }, []);

  return state;
}
