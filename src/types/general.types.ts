export interface searchQuery {
  page?: string;
  search?: string;
  limit?: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
};
