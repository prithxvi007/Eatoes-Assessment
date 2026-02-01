import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useOptimisticUpdate(initialData) {
  const [data, setData] = useState(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOptimistically = useCallback(async (updateFn, apiCall, errorMessage = 'Update failed') => {
    // Save current state for rollback
    const previousData = [...data];
    
    // Optimistically update UI
    setData(updateFn);
    
    try {
      setIsUpdating(true);
      await apiCall();
      toast.success('Update successful');
    } catch (error) {
      // Rollback on error
      setData(previousData);
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [data]);

  return { data, setData, isUpdating, updateOptimistically };
}