'use client';

import { useState } from 'react';
import { symptoms, analyzeSymptoms, type Condition } from '@/lib/data/symptoms';

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<Condition[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleToggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
  };

  const handleSubmit = () => {
    const matchedConditions = analyzeSymptoms(selectedSymptoms);
    setResults(matchedConditions);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setSelectedSymptoms([]);
    setResults([]);
    setIsSubmitted(false);
  };

  // Urgency level colors
  const urgencyColors = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'emergency': 'bg-red-100 text-red-800',
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Symptom Checker</h1>
          <p className="text-gray-600 mb-8">
            Select the symptoms you're experiencing to get a preliminary assessment. 
            <span className="font-semibold text-red-600 ml-2">
              This is not a substitute for professional medical advice.
            </span>
          </p>

          {!isSubmitted ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Symptoms:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {symptoms.map(symptom => (
                  <div 
                    key={symptom.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSymptoms.includes(symptom.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => handleToggleSymptom(symptom.id)}
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={() => {}}
                        className="h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="ml-3 font-medium">{symptom.name}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{symptom.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleSubmit}
                  disabled={selectedSymptoms.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium text-white ${
                    selectedSymptoms.length > 0 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Analyze My Symptoms
                </button>
              </div>
            </>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results:</h2>
              
              {results.length > 0 ? (
                <div className="space-y-6">
                  <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                    Based on the symptoms you selected, here are some possible conditions. 
                    Please consult with a healthcare professional for proper diagnosis.
                  </p>
                  
                  {results.map(condition => (
                    <div key={condition.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{condition.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgencyColors[condition.urgencyLevel]}`}>
                            {condition.urgencyLevel.charAt(0).toUpperCase() + condition.urgencyLevel.slice(1)} Urgency
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-4">{condition.description}</p>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Matching Symptoms:</h4>
                          <div className="flex flex-wrap gap-2">
                            {condition.symptoms
                              .filter(id => selectedSymptoms.includes(id))
                              .map(id => {
                                const symptom = symptoms.find(s => s.id === id);
                                return symptom ? (
                                  <span key={id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {symptom.name}
                                  </span>
                                ) : null;
                              })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Recommended Actions:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {condition.recommendedActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    No matching conditions found based on your selected symptoms.
                  </p>
                  <p className="text-gray-600">
                    Please try selecting different symptoms or consult with a healthcare professional.
                  </p>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={resetForm}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Check Different Symptoms
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div>
                  <p className="font-medium text-red-800">Important Disclaimer</p>
                  <p className="text-sm text-red-700 mt-1">
                    This symptom checker is for informational purposes only and is not a qualified medical opinion.
                    Always consult with a healthcare professional for proper diagnosis and treatment.
                    If you're experiencing a medical emergency, call your local emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 