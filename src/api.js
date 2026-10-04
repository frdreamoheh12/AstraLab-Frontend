import { useCallback, useEffect, useState } from 'react';

const API_URL = 'https://astralab-backend.onrender.com';

export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;

  const response = await fetch(API_URL + '/api' + path, {
    ...options,
    headers: {
      ...(!isForm && options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    },
    ...(options.body && !isForm ? { body: JSON.stringify(options.body) } : {})
  });

  const data = await response.json();

  if (!response.ok) {
    const e = new Error(data.error || 'The request could not be completed.');
    e.status = response.status;
    throw e;
  }

  return data;
}

export function useApi(path) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let live = true;

    setState(s => ({
      ...s,
      loading: true,
      error: null
    }));

    api(path)
      .then(data => live && setState({
        data,
        loading: false,
        error: null
      }))
      .catch(error => live && setState({
        data: null,
        loading: false,
        error
      }));

    return () => {
      live = false;
    };
  }, [path, revision]);

  return {
    ...state,
    refresh: useCallback(() => setRevision(r => r + 1), [])
  };
}

export const money = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);

export const date = value =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Not yet available';

export const roleLabel = role =>
  ({
    USER: 'Member',
    FREE_DROPPER: 'Free Dropper',
    PAID_DROPPER: 'Paid Dropper',
    ADMIN: 'Administrator',
    CREATOR: 'Creator'
  }[role] || role);