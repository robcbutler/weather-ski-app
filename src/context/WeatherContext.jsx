import { createContext, useContext, useReducer, useCallback } from 'react';

const WeatherContext = createContext(null);

const initialState = {
  // Search
  query: '',
  searchResults: [],
  isSearching: false,
  searchOpen: false,
  // City
  selectedCity: null,
  // Weather data
  isLoading: false,
  error: null,
  currentWeather: null,
  hourlyForecast: [],
  dailyForecast: [],
  daySegments: null,
  precipChart: [],
  sunrise: null,
  sunset: null,
  weatherCategory: 'clear',
  weatherParticle: 'none',
  // UI
  timeOfDay: 'day',
};

function weatherReducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload, searchOpen: true };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'SET_SEARCH_OPEN':
      return { ...state, searchOpen: action.payload };
    case 'SELECT_CITY':
      return {
        ...state,
        selectedCity: action.payload,
        query: '',
        searchResults: [],
        searchOpen: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_WEATHER_DATA':
      return { ...state, ...action.payload, isLoading: false, error: null };
    case 'SET_TIME_OF_DAY':
      return { ...state, timeOfDay: action.payload };
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const selectCity = useCallback((city) => {
    dispatch({ type: 'SELECT_CITY', payload: city });
  }, []);

  const setQuery = useCallback((q) => {
    dispatch({ type: 'SET_QUERY', payload: q });
  }, []);

  const setSearchOpen = useCallback((open) => {
    dispatch({ type: 'SET_SEARCH_OPEN', payload: open });
  }, []);

  const setWeatherData = useCallback((data) => {
    dispatch({ type: 'SET_WEATHER_DATA', payload: data });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((err) => {
    dispatch({ type: 'SET_ERROR', payload: err });
  }, []);

  const setTimeOfDay = useCallback((tod) => {
    dispatch({ type: 'SET_TIME_OF_DAY', payload: tod });
  }, []);

  const setSearchResults = useCallback((results) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  }, []);

  const setSearching = useCallback((searching) => {
    dispatch({ type: 'SET_SEARCHING', payload: searching });
  }, []);

  return (
    <WeatherContext.Provider value={{
      state,
      selectCity,
      setQuery,
      setSearchOpen,
      setWeatherData,
      setLoading,
      setError,
      setTimeOfDay,
      setSearchResults,
      setSearching,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used inside WeatherProvider');
  return ctx;
}
