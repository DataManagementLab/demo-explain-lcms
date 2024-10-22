import { UseQueryResult } from '@tanstack/react-query';

export default function combineUseQueries<T>(
  results: UseQueryResult<T, Error>[],
) {
  return {
    data: results.map((result) => result.data),
    isSuccess: results.every((result) => result.isSuccess),
  };
}
