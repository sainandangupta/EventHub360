import { useContext } from 'react';
import { LeaveContext } from '../context/LeaveContext';

export default function useLeave() {
  const context = useContext(LeaveContext);
  if (!context) throw new Error('useLeave must be used within LeaveProvider');
  return context;
}
