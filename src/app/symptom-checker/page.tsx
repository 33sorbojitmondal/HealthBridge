'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRequireAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { symptoms, analyzeSymptoms, Symptom, Condition } from '@/lib/data/symptoms';

// Interface for body part categories
interface BodyPart {
  id: string;
  name: string;
  symptoms: Symptom[];
}

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading symptom checker...</p>
    </div>
  );
}

export default function SymptomCheckerPage() {
  // Call hooks at the top level
  const router = useRouter();
  const { session, status } = useRequireAuth('/login?callbackUrl=/symptom-checker');
  
  // Component state
  const [loaded, setLoaded] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string>('');
  const [duration, setDuration] = useState<string>('days');
  const [severity, setSeverity] = useState<string>('moderate');
  const [results, setResults] = useState<Condition[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState<'symptoms' | 'details' | 'results'>('symptoms');
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);

  // Use useCallback for all handler functions to avoid unnecessary re-renders
  const handleSymptomToggle = useCallback((symptomId: string) => {
    setSelectedSymptoms(prevSymptoms => 
      prevSymptoms.includes(symptomId)
        ? prevSymptoms.filter(id => id !== symptomId)
        : [...prevSymptoms, symptomId]
    );
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedSymptoms.length > 0) {
      setStage('details');
    } else {
      alert('Please select at least one symptom to continue.');
    }
  }, [selectedSymptoms]);

  // Define generateResults with useCallback to avoid recreation on every render
  const generateResults = useCallback((): Condition[] => {
    if (selectedSymptoms.includes('headache') && selectedSymptoms.includes('fever')) {
      return [
        {
          name: 'Common Cold',
          probability: 'high',
          description: 'A viral infection of the upper respiratory tract that affects the nose and throat.',
          recommendation: 'Rest, stay hydrated, and take over-the-counter pain relievers. If symptoms persist or worsen, consult a healthcare provider.'
        },
        {
          name: 'Influenza (Flu)',
          probability: 'medium',
          description: 'A viral infection that attacks your respiratory system — your nose, throat, and lungs.',
          recommendation: 'Rest, stay hydrated, and take over-the-counter fever reducers. Antiviral medications may be prescribed. If symptoms are severe, consult a healthcare provider.'
        },
        {
          name: 'COVID-19',
          probability: 'medium',
          description: 'A respiratory illness caused by the SARS-CoV-2 virus.',
          recommendation: 'Get tested for COVID-19. Self-isolate, rest, and stay hydrated. If symptoms worsen, especially breathing difficulties, seek medical attention immediately.'
        }
      ];
    } else if (selectedSymptoms.includes('chest-pain') && selectedSymptoms.includes('shortness-of-breath')) {
      return [
        {
          name: 'Anxiety Attack',
          probability: 'medium',
          description: 'A sudden episode of intense fear or anxiety that triggers severe physical reactions.',
          recommendation: 'Practice deep breathing exercises. If symptoms are recurring, consider consulting a mental health professional.'
        },
        {
          name: 'Asthma',
          probability: 'medium',
          description: 'A condition in which your airways narrow and swell and may produce extra mucus.',
          recommendation: 'Use a rescue inhaler if prescribed. If this is a new symptom or you don\'t have an asthma diagnosis, consult a healthcare provider.'
        },
        {
          name: 'Heart-related Issue',
          probability: 'low',
          description: 'Chest pain and difficulty breathing can be symptoms of various heart conditions.',
          recommendation: 'Seek immediate medical attention, especially if pain is severe, spreads to arm or jaw, or is accompanied by nausea or excessive sweating.'
        }
      ];
    } else if (selectedSymptoms.includes('abdominal-pain') && selectedSymptoms.includes('nausea')) {
      return [
        {
          name: 'Gastroenteritis',
          probability: 'high',
          description: 'Inflammation of the lining of the stomach and intestines, characterized by diarrhea, abdominal cramps, nausea, or vomiting.',
          recommendation: 'Stay hydrated, rest, and eat mild, easily digestible foods. If symptoms persist over 48 hours or are severe, consult a healthcare provider.'
        },
        {
          name: 'Food Poisoning',
          probability: 'medium',
          description: 'Illness caused by consuming contaminated food or drink.',
          recommendation: 'Stay hydrated and rest. If symptoms are severe, persistent, or accompanied by high fever, seek medical attention.'
        },
        {
          name: 'Irritable Bowel Syndrome',
          probability: 'low',
          description: 'A chronic disorder affecting the large intestine that causes abdominal pain, bloating, gas, diarrhea and constipation.',
          recommendation: 'Manage symptoms through diet, stress reduction, and prescribed medications. Consult a healthcare provider for proper diagnosis and treatment plan.'
        }
      ];
    } else {
      // Default if no specific pattern is matched
      return [
        {
          name: 'General Illness',
          probability: 'medium',
          description: 'Your symptoms may indicate a general illness or condition that requires further evaluation.',
          recommendation: 'Monitor your symptoms. If they persist or worsen, consult with a healthcare provider for proper diagnosis and treatment.'
        },
        {
          name: 'Stress-related Symptoms',
          probability: 'low',
          description: 'Physical symptoms can sometimes be related to stress and anxiety.',
          recommendation: 'Practice stress-reduction techniques such as deep breathing, meditation, or light exercise. Ensure you\'re getting adequate rest and maintaining a balanced diet.'
        }
      ];
    }
  }, [selectedSymptoms]);

  const handleAnalyzeSymptoms = useCallback(() => {
    setIsAnalyzing(true);
    // Simulate API call delay
    setTimeout(() => {
      try {
        const analysisResults = analyzeSymptoms(selectedSymptoms);
        // If no specific conditions were found, fall back to generateResults
        setResults(analysisResults.length > 1 ? analysisResults : generateResults());
        setStage('results');
      } catch (error) {
        console.error('Error analyzing symptoms:', error);
        // Fall back to generated results if there's an error
        setResults(generateResults());
        setStage('results');
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000);
  }, [selectedSymptoms, generateResults]);

  const handleReset = useCallback(() => {
    setSelectedBodyPart(null);
    setSelectedSymptoms([]);
    setAdditionalSymptoms('');
    setDuration('days');
    setSeverity('moderate');
    setResults(null);
    setStage('symptoms');
  }, []);

  // Simple loading effect
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize body parts data - no early return or conditional hook calls
  useEffect(() => {
    if (status === 'authenticated') {
      setBodyParts([
        {
          id: 'head',
          name: 'Head & Face',
          symptoms: [
            { id: 'headache', name: 'Headache', description: 'Pain in any region of the head.' },
            { id: 'dizziness', name: 'Dizziness', description: 'Feeling lightheaded, unsteady, or faint.' },
            { id: 'blurred-vision', name: 'Blurred Vision', description: 'Lack of sharpness of vision.' },
            { id: 'ear-pain', name: 'Ear Pain', description: 'Pain in the ear canal.' },
            { id: 'fever', name: 'Fever', description: 'Elevated body temperature.' },
          ]
        },
        {
          id: 'chest',
          name: 'Chest & Back',
          symptoms: [
            { id: 'chest-pain', name: 'Chest Pain', description: 'Pain or discomfort in the chest area.' },
            { id: 'shortness-of-breath', name: 'Shortness of Breath', description: 'Difficult or labored breathing.' },
            { id: 'cough', name: 'Cough', description: 'Sudden expulsion of air from the lungs.' },
            { id: 'rapid-heartbeat', name: 'Rapid Heartbeat', description: 'Heart beats faster than normal.' },
          ]
        },
        {
          id: 'abdomen',
          name: 'Abdomen',
          symptoms: [
            { id: 'abdominal-pain', name: 'Abdominal Pain', description: 'Pain in the region between the chest and pelvis.' },
            { id: 'nausea', name: 'Nausea', description: 'Feeling of sickness with an inclination to vomit.' },
            { id: 'vomiting', name: 'Vomiting', description: 'Forceful expulsion of stomach contents.' },
            { id: 'diarrhea', name: 'Diarrhea', description: 'Loose, watery bowel movements.' },
          ]
        },
        {
          id: 'limbs',
          name: 'Arms & Legs',
          symptoms: [
            { id: 'joint-pain', name: 'Joint Pain', description: 'Pain in the joints of the body.' },
            { id: 'body-ache', name: 'Muscle Aches', description: 'Generalized pain in muscles throughout the body.' },
            { id: 'swelling', name: 'Swelling', description: 'Abnormal enlargement of body parts.' },
            { id: 'numbness', name: 'Numbness', description: 'Loss of sensation or feeling.' },
            { id: 'fatigue', name: 'Fatigue', description: 'Extreme tiredness resulting from mental or physical exertion.' },
          ]
        },
        {
          id: 'skin',
          name: 'Skin',
          symptoms: [
            { id: 'rash', name: 'Rash', description: 'Eruption of the skin that may cause discoloration, itching, or inflammation.' },
            { id: 'itching', name: 'Itching', description: 'Irritating sensation that causes a desire to scratch.' },
            { id: 'hives', name: 'Hives', description: 'Raised, often itchy, red welts on the skin.' },
            { id: 'bruising', name: 'Bruising', description: 'Discoloration of the skin resulting from leakage of blood.' },
          ]
        },
      ]);
    }
  }, [status]);

  // Helper function for urgency color
  const getUrgencyColor = useCallback((level: string) => {
    switch(level) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': 
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  }, []);

  // Always render something, no early returns in the component body
  if (!loaded || status === 'loading') {
    return <LoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <LoadingScreen />;
  }

  // Main content - fully featured
  return (
    <div className="max-w-5xl mx-auto pt-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Symptom Checker</h1>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Back to Profile
          </Link>
          <Link
            href="/medical-directory"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Find a Doctor
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Check Your Symptoms</h2>
          <p className="text-blue-100 mt-1">
            This tool helps you understand possible causes for your symptoms and provides guidance on what to do next.
          </p>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stage === 'symptoms' || stage === 'details' || stage === 'results' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  <span className={`text-sm font-medium ${
                    stage === 'symptoms' || stage === 'details' || stage === 'results' 
                      ? 'text-white' 
                      : 'text-gray-500'
                  }`}>1</span>
                </div>
                <div className={`h-1 w-12 md:w-24 ${
                  stage === 'details' || stage === 'results' ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
              </div>
              
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stage === 'details' || stage === 'results' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  <span className={`text-sm font-medium ${
                    stage === 'details' || stage === 'results' 
                      ? 'text-white' 
                      : 'text-gray-500'
                  }`}>2</span>
                </div>
                <div className={`h-1 w-12 md:w-24 ${
                  stage === 'results' ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
              </div>
              
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stage === 'results' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  <span className={`text-sm font-medium ${
                    stage === 'results' 
                      ? 'text-white' 
                      : 'text-gray-500'
                  }`}>3</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-2">
              <div className="text-sm font-medium text-gray-700 text-center" style={{marginLeft: "-20px"}}>Symptoms</div>
              <div className="text-sm font-medium text-gray-700 text-center">Details</div>
              <div className="text-sm font-medium text-gray-700 text-center" style={{marginRight: "-20px"}}>Results</div>
            </div>
          </div>

          {/* Symptom Selection Stage */}
          {stage === 'symptoms' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Select Body Area</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bodyParts.map((part) => (
                    <button
                      key={part.id}
                      className={`p-4 rounded-lg border ${
                        selectedBodyPart === part.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } transition-colors`}
                      onClick={() => setSelectedBodyPart(part.id)}
                    >
                      <h4 className="font-medium text-gray-800">{part.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{part.symptoms.length} symptoms</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Select Symptoms</h3>
                
                {selectedBodyPart ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bodyParts.find(part => part.id === selectedBodyPart)?.symptoms.map((symptom) => (
                        <div 
                          key={symptom.id}
                          className={`p-3 rounded-lg border cursor-pointer ${
                            selectedSymptoms.includes(symptom.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                          onClick={() => handleSymptomToggle(symptom.id)}
                        >
                          <div className="flex items-center">
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                              selectedSymptoms.includes(symptom.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedSymptoms.includes(symptom.id) && (
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="ml-3 text-gray-800">{symptom.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Please select a body area to see related symptoms</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Detail Entry Stage */}
          {stage === 'details' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Selected Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(symptomId => {
                    const symptomName = bodyParts
                      .flatMap(part => part.symptoms)
                      .find(s => s.id === symptomId)?.name;
                    
                    return (
                      <div 
                        key={symptomId} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {symptomName || symptomId}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="additional" className="block text-sm font-medium text-gray-700 mb-1">
                    Any additional symptoms or details?
                  </label>
                  <textarea
                    id="additional"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe any other symptoms or provide more context..."
                    value={additionalSymptoms}
                    onChange={(e) => setAdditionalSymptoms(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      How long have you had these symptoms?
                    </label>
                    <select
                      id="duration"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                      How severe are your symptoms?
                    </label>
                    <select
                      id="severity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="mild">Mild - Noticeable but not interfering with daily activities</option>
                      <option value="moderate">Moderate - Somewhat interfering with daily activities</option>
                      <option value="severe">Severe - Significantly interfering with daily activities</option>
                      <option value="very_severe">Very Severe - Unable to perform daily activities</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setStage('symptoms')}
                >
                  Back
                </button>
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center"
                  onClick={handleAnalyzeSymptoms}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Symptoms'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Stage */}
          {stage === 'results' && results && (
            <div>
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Important Information</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          This tool provides general information and is not a substitute for professional medical advice. 
                          If you're experiencing severe symptoms or a medical emergency, please seek immediate medical attention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Possible Conditions</h3>
                
                <div className="space-y-4">
                  {results.map((condition, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-800">{condition.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          condition.probability === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : condition.probability === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {condition.probability === 'high' 
                            ? 'High Match' 
                            : condition.probability === 'medium'
                              ? 'Medium Match'
                              : 'Low Match'}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 mb-4">{condition.description}</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <h5 className="text-sm font-medium text-blue-800 mb-2">Recommendation</h5>
                          <p className="text-sm text-blue-700">{condition.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">What Next?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mx-auto mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-center text-md font-medium text-gray-800 mb-2">Schedule Appointment</h4>
                    <p className="text-center text-sm text-gray-600">Book a consultation with a healthcare provider for a proper diagnosis.</p>
                    <div className="mt-4 text-center">
                      <Link
                        href="/virtual-consultation"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h4 className="text-center text-md font-medium text-gray-800 mb-2">Talk to Community</h4>
                    <p className="text-center text-sm text-gray-600">Connect with others who may have experienced similar symptoms.</p>
                    <div className="mt-4 text-center">
                      <Link
                        href="/community-forum"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Join Forum
                      </Link>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-center text-md font-medium text-gray-800 mb-2">Track Symptoms</h4>
                    <p className="text-center text-sm text-gray-600">Monitor your symptoms over time to identify patterns and changes.</p>
                    <div className="mt-4 text-center">
                      <Link
                        href="/health-tracking"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Start Tracking
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  onClick={handleReset}
                >
                  Start New Check
                </button>
                <Link
                  href="/medical-directory"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Find a Doctor
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Medical Disclaimer:</p>
        <p>
          The AI Symptom Checker is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
          Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
        </p>
      </div>
    </div>
  );
}