import { useEffect } from 'react';
import { emergencyService, dashboardService } from '@resqlink/shared';
import { useEmergencyStore } from '../store/emergencyStore';
import { useDashboardStore } from '../store/dashboardStore';

export function useEmergencies() {
  const { emergencies, setEmergencies, isLoading, setLoading } = useEmergencyStore();
  const { setAnalytics, setRescueTeams, setHospitals, setDrones } = useDashboardStore();

  useEffect(() => {
    setLoading(true);

    const unsubE = emergencyService.subscribeToEmergencies((list) => {
      setEmergencies(list);
      setAnalytics(dashboardService.generateAnalytics(
        list.map((e) => ({ status: e.status, type: e.type, createdAt: e.createdAt }))
      ));
      setLoading(false);
    });

    const unsubT = dashboardService.subscribeToRescueTeams(setRescueTeams);
    const unsubH = dashboardService.subscribeToHospitals(setHospitals);
    const unsubD = dashboardService.subscribeToDrones(setDrones);

    return () => {
      unsubE();
      unsubT();
      unsubH();
      unsubD();
    };
  }, []);

  return { emergencies, isLoading };
}
