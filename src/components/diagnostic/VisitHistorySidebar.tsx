import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import type { MedicalReport } from '@/lib/database.types';
import { formatDate, getVisitReasonLabel } from '@/lib/utils';
import { FilterModal } from './FilterModal';

interface VisitHistorySidebarProps {
  patientName: string;
  reports: MedicalReport[];
  selectedReport: string | null;
  onReportSelect: (reportId: string) => void;
}

export function VisitHistorySidebar({
  patientName,
  reports,
  selectedReport,
  onReportSelect,
}: VisitHistorySidebarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    visitReason: '',
    healthStatus: '',
  });

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const reportDate = new Date(report.created_at);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && reportDate < startDate) return false;
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        if (reportDate > endDate) return false;
      }
      if (filters.visitReason && report.visit_reason !== filters.visitReason) return false;
      if (filters.healthStatus && report.health_status !== filters.healthStatus) return false;

      return true;
    });
  }, [reports, filters]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{patientName}</h2>
            <p className="text-sm text-gray-500">Visit History</p>
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredReports.map((report) => (
          <button
            key={report.id}
            onClick={() => onReportSelect(report.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              selectedReport === report.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(report.created_at)}
              </div>
              {report.health_status && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  report.health_status === 'improving' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.health_status === 'improving' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {report.health_status === 'improving' ? 'Improving' : 'Deteriorating'}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900">
              {getVisitReasonLabel(report.visit_reason)}
            </p>
          </button>
        ))}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}