import { UseQueryResult } from '@tanstack/react-query';

export function combineUseQueries<T>(
  results: UseQueryResult<T | undefined, Error>[],
):
  | { data: T[]; isSuccess: true }
  | { data: (T | undefined)[]; isSuccess: false } {
  const isSuccess =
    results.every((result) => result.isSuccess) &&
    results.every((result) => result.data);
  if (isSuccess) {
    return {
      data: results.map((result) => result.data!),
      isSuccess: true,
    };
  } else {
    return {
      data: results.map((result) => result.data!),
      isSuccess: false,
    };
  }
}
