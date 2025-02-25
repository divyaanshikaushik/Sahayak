import React, { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { visitReasonOptions } from '@/lib/utils';
import { generateMedicalReport, generatePDF } from '@/lib/ai';
import { Download } from 'lucide-react';

interface DiseasePredictorTabProps {
  visitReason: string;
  onVisitReasonChange: (reason: string) => void;
}

interface HealthParameter {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

const healthParameters: HealthParameter[] = [
  {
    id: 'blood_pressure',
    label: 'Blood Pressure',
    options: [
      { value: 'normal', label: 'Normal (120/80)' },
      { value: 'elevated', label: 'Elevated (120-129/80)' },
      { value: 'high_stage1', label: 'High - Stage 1 (130-139/80-89)' },
      { value: 'high_stage2', label: 'High - Stage 2 (140+/90+)' },
      { value: 'crisis', label: 'Hypertensive Crisis (180+/120+)' },
    ],
  },
  {
    id: 'blood_sugar',
    label: 'Blood Sugar',
    options: [
      { value: 'normal', label: 'Normal (70-99 mg/dL)' },
      { value: 'prediabetes', label: 'Pre-diabetes (100-125 mg/dL)' },
      { value: 'diabetes', label: 'Diabetes (126+ mg/dL)' },
    ],
  },
  {
    id: 'cholesterol',
    label: 'Cholesterol Levels',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'borderline', label: 'Borderline High' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    id: 'bmi',
    label: 'BMI Category',
    options: [
      { value: 'underweight', label: 'Underweight (<18.5)' },
      { value: 'normal', label: 'Normal (18.5-24.9)' },
      { value: 'overweight', label: 'Overweight (25-29.9)' },
      { value: 'obese', label: 'Obese (30+)' },
    ],
  },
];

const commonSymptoms = [
  'Fever',
  'Cough',
  'Fatigue',
  'Headache',
  'Body Aches',
  'Shortness of Breath',
  'Chest Pain',
  'Nausea',
  'Diarrhea',
  'Loss of Appetite',
];

export function DiseasePredictorTab({ visitReason, onVisitReasonChange }: DiseasePredictorTabProps) {
  const [symptoms, setSymptoms] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParameterChange = (id: string, value: string) => {
    setParameters(prev => ({ ...prev, [id]: value }));
  };

  const addSymptom = (symptom: string) => {
    setSymptoms(prev => {
      const currentSymptoms = prev.split('\n').filter(s => s.trim());
      if (!currentSymptoms.includes(symptom)) {
        return [...currentSymptoms, symptom].join('\n');
      }
      return prev;
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const report = await generateMedicalReport(
        symptoms,
        parameters as any,
        visitReason
      );
      setReportContent(report);
      setPrediction(report);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate medical report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (reportContent) {
      generatePDF(reportContent);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visit Reason
        </label>
        <Select
          options={visitReasonOptions as any}
          value={visitReason}
          onChange={(e) => onVisitReasonChange(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Health Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthParameters.map((param) => (
            <div key={param.id}>
              <Select
                label={param.label}
                options={[{ value: '', label: `Select ${param.label}` }, ...param.options]}
                value={parameters[param.id] || ''}
                onChange={(e) => handleParameterChange(param.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Common Symptoms
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonSymptoms.map((symptom) => (
            <button
              key={symptom}
              onClick={() => addSymptom(symptom)}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100"
            >
              + {symptom}
            </button>
          ))}
        </div>
        <TextArea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter symptoms and observations..."
          rows={4}
        />
      </div>

      <Button
        onClick={handlePredict}
        disabled={loading || !symptoms.trim() || Object.keys(parameters).length === 0}
        className="w-full"
      >
        {loading ? 'Analyzing...' : 'Predict Disease'}
      </Button>

      {prediction && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Medical Report</h3>
            <Button
              onClick={handleDownloadPDF}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{prediction}</pre>
          </div>
        </div>
      )}
    </div>
  );
}