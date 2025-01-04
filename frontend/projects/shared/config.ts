export const API_CONFIG = {
  auth: {
    baseUrl: 'http://127.0.0.1:8081',
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
    }
  },
  time: {
    baseUrl: 'http://localhost:5000',
    endpoints: {
      currentSession: '/api/time/getCurrentSession',
      startSession: '/api/time/startSession',
      stopSession: '/api/time/stopSession',
      summary: '/api/time/weekly-summary'
    }
  },
  calendar: {
    baseUrl: 'http://127.0.0.1:8000',
    endpoints: {
      calendar: '/api/calendar',
      absences: '/api/absences/store'
    }
  }
};

export const getApiUrl = (service: keyof typeof API_CONFIG, endpoint: string): string => {
  const config = API_CONFIG[service];
  return `${config.baseUrl}${endpoint}`;
};

export const getAuthEndpoint = (endpoint: keyof typeof API_CONFIG.auth.endpoints): string => {
  return getApiUrl('auth', API_CONFIG.auth.endpoints[endpoint]);
};

export const getTimeEndpoint = (endpoint: keyof typeof API_CONFIG.time.endpoints): string => {
  return getApiUrl('time', API_CONFIG.time.endpoints[endpoint]);
};

export const getCalendarEndpoint = (endpoint: keyof typeof API_CONFIG.calendar.endpoints): string => {
  return getApiUrl('calendar', API_CONFIG.calendar.endpoints[endpoint]);
};
