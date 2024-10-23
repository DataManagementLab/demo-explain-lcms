import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

function getFeatures() {
  return api.get<string[]>('general/features').json();
}

export function useGetFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
    gcTime: 60 * 60 * 1000,
  });
}
