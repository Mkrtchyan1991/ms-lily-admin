// Define error type for better type safety
export interface ApiError {
  response?: { data?: { message?: string } };
  message?: string;
}

export const catchErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message;
};
