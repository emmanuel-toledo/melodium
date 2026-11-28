import { QueryClient } from '@tanstack/react-query'

/** React Query client (react-data: configured in the composition root). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
