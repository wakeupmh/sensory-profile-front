import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { childApi, type ChildData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

export function useDomainPage() {
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [children, setChildren] = useState<ChildData[]>([]);
  const [searchParams] = useSearchParams();
  const [selectedChildId, setSelectedChildId] = useState<string>(searchParams.get('childId') || '');

  const fetchChildren = useCallback(async () => {
    try {
      const token = await getTokenRef.current();
      const list = await childApi.list(token);
      setChildren(list);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    if (isLoaded && session) {
      fetchChildren();
    }
  }, [fetchChildren, isLoaded, session]);

  const effectiveChildId = selectedChildId;

  return { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef };
}
