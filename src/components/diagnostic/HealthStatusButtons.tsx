import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HealthStatusButtonsProps {
  currentStatus: 'improving' | 'deteriorating' | null;
  onStatusChange: (status: 'improving' | 'deteriorating') => void;
}

export function HealthStatusButtons({ currentStatus, onStatusChange }: HealthStatusButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentStatus === 'improving' ? 'success' : 'secondary'}
        onClick={() => onStatusChange('improving')}
      >
        <TrendingUp className="h-4 w-4 mr-1" />
        Improving
      </Button>
      <Button
        variant={currentStatus === 'deteriorating' ? 'danger' : 'secondary'}
        onClick={() => onStatusChange('deteriorating')}
      >
        <TrendingDown className="h-4 w-4 mr-1" />
        Deteriorating
      </Button>
    </div>
  );
}