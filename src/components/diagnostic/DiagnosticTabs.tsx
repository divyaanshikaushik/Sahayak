import React, { useState } from 'react';
import { FileText, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportSummaryTab } from './ReportSummaryTab';
import { DiseasePredictorTab } from './DiseasePredictorTab';

interface DiagnosticTabsProps {
  visitReason: string;
  onVisitReasonChange: (reason: string) => void;
}

export function DiagnosticTabs({ visitReason, onVisitReasonChange }: DiagnosticTabsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'predictor'>('summary');
  const [expandedTab, setExpandedTab] = useState<'summary' | 'predictor' | null>('summary');

  const toggleTab = (tab: 'summary' | 'predictor') => {
    if (expandedTab === tab) {
      setExpandedTab(null);
    } else {
      setExpandedTab(tab);
      setActiveTab(tab);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Summary Tab */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleTab('summary')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Report Summary</span>
          </div>
          {expandedTab === 'summary' ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        <div
          className={cn(
            'transition-all duration-200 ease-in-out',
            expandedTab === 'summary' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          )}
        >
          <div className="p-6">
            <ReportSummaryTab />
          </div>
        </div>
      </div>

      {/* Disease Predictor Tab */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleTab('predictor')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Disease Predictor</span>
          </div>
          {expandedTab === 'predictor' ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        <div
          className={cn(
            'transition-all duration-200 ease-in-out',
            expandedTab === 'predictor' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          )}
        >
          <div className="p-6">
            <DiseasePredictorTab
              visitReason={visitReason}
              onVisitReasonChange={onVisitReasonChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}