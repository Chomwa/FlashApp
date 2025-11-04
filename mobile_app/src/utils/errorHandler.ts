/**
 * Error handling utilities for Flash app
 */

export interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      detail?: string;
      message?: string;
      phone_number?: string[];
      password?: string[];
      non_field_errors?: string[];
    };
  };
  message?: string;
}

export const getApiErrorMessage = (error: ApiErrorResponse): string => {
  // Handle network errors
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const { status, data } = error.response;

  // Handle specific status codes
  switch (status) {
    case 400:
      // Bad request - validation errors
      if (data?.phone_number?.[0]) {
        return `Phone number: ${data.phone_number[0]}`;
      }
      if (data?.password?.[0]) {
        return `Password: ${data.password[0]}`;
      }
      if (data?.non_field_errors?.[0]) {
        return data.non_field_errors[0];
      }
      if (data?.detail) {
        return data.detail;
      }
      if (data?.message) {
        return data.message;
      }
      return 'Invalid input. Please check your information.';

    case 401:
      return 'Invalid credentials. Please check your login information.';

    case 403:
      return 'Access denied. Please contact support.';

    case 404:
      return 'Service not found. Please try again later.';

    case 409:
      return 'This phone number is already registered.';

    case 429:
      return 'Too many requests. Please wait a moment and try again.';

    case 500:
      return 'Server error. Please check your phone number format and try again.';

    case 503:
      return 'Service temporarily unavailable. Please try again later.';

    default:
      return data?.detail || data?.message || 'Something went wrong. Please try again.';
  }
};

export const getPhoneValidationMessage = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return 'Please enter your phone number';
  }

  if (cleaned.length < 9) {
    return 'Phone number is too short';
  }

  if (cleaned.length > 12) {
    return 'Phone number is too long';
  }

  if (cleaned.startsWith('260')) {
    if (cleaned.length !== 12) {
      return 'Format: +260 9XX XXX XXX (12 digits total)';
    }
    if (!cleaned.substring(3).match(/^(97|76|96)/)) {
      return 'Number must start with 260 97X, 260 76X, or 260 96X';
    }
  } else if (cleaned.startsWith('09')) {
    if (cleaned.length !== 10) {
      return 'Format: 09X XXX XXXX (10 digits total)';
    }
    if (!cleaned.substring(2, 3).match(/[769]/)) {
      return 'Number must start with 097, 096, or 076';
    }
  } else if (cleaned.length === 9) {
    if (!cleaned.match(/^(97|76|96)/)) {
      return 'Number must start with 97X, 76X, or 96X';
    }
  } else {
    return 'Use format: +260 9XX XXX XXX or 09X XXX XXXX';
  }

  return 'Valid phone number';
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('260') && cleaned.length === 12) {
    const countryCode = cleaned.substring(0, 3);
    const prefix = cleaned.substring(3, 6);
    const middle = cleaned.substring(6, 9);
    const last = cleaned.substring(9, 12);
    return `+${countryCode} ${prefix} ${middle} ${last}`;
  }

  if (cleaned.startsWith('09') && cleaned.length === 10) {
    const prefix = cleaned.substring(0, 3);
    const middle = cleaned.substring(3, 6);
    const last = cleaned.substring(6, 10);
    return `${prefix} ${middle} ${last}`;
  }

  if (cleaned.length === 9 && cleaned.match(/^(97|76|96)/)) {
    const prefix = cleaned.substring(0, 3);
    const middle = cleaned.substring(3, 6);
    const last = cleaned.substring(6, 9);
    return `${prefix} ${middle} ${last}`;
  }

  return phone;
};