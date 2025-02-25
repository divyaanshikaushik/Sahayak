import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { visitReasonOptions } from '@/lib/utils';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    startDate: string;
    endDate: string;
    visitReason: string;
    healthStatus: string;
  };
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    visitReason: string;
    healthStatus: string;
  }) => void;
}

export function FilterModal({ isOpen, onClose, filters, onFilterChange }: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filter Reports</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <Select
            label="Visit Reason"
            options={[
              { value: '', label: 'All' },
              ...visitReasonOptions,
            ]}
            value={filters.visitReason}
            onChange={(e) => onFilterChange({ ...filters, visitReason: e.target.value })}
          />

          <Select
            label="Health Status"
            options={[
              { value: '', label: 'All' },
              { value: 'improving', label: 'Improving' },
              { value: 'deteriorating', label: 'Deteriorating' },
            ]}
            value={filters.healthStatus}
            onChange={(e) => onFilterChange({ ...filters, healthStatus: e.target.value })}
          />

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                onFilterChange({
                  startDate: '',
                  endDate: '',
                  visitReason: '',
                  healthStatus: '',
                });
                onClose();
              }}
            >
              Reset
            </Button>
            <Button onClick={onClose}>Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}