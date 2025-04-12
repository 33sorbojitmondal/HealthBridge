// Sample symptom database
export type Symptom = {
  id: string;
  name: string;
  description: string;
};

export type Condition = {
  id: string;
  name: string;
  description: string;
  symptoms: string[]; // Array of symptom IDs
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
};

// Sample symptoms
export const symptoms: Symptom[] = [
  {
    id: 'fever',
    name: 'Fever',
    description: 'Elevated body temperature above the normal range.'
  },
  {
    id: 'cough',
    name: 'Cough',
    description: 'Sudden expulsion of air from the lungs to clear the air passages.'
  },
  {
    id: 'headache',
    name: 'Headache',
    description: 'Pain in any region of the head.'
  },
  {
    id: 'sore-throat',
    name: 'Sore Throat',
    description: 'Pain, scratchiness or irritation of the throat.'
  },
  {
    id: 'fatigue',
    name: 'Fatigue',
    description: 'Extreme tiredness resulting from mental or physical exertion.'
  },
  {
    id: 'body-ache',
    name: 'Body Ache',
    description: 'Generalized pain in muscles and joints throughout the body.'
  },
  {
    id: 'nausea',
    name: 'Nausea',
    description: 'Feeling of sickness with an inclination to vomit.'
  },
  {
    id: 'dizziness',
    name: 'Dizziness',
    description: 'Feeling lightheaded, unsteady, or faint.'
  },
  {
    id: 'shortness-of-breath',
    name: 'Shortness of Breath',
    description: 'Difficult or labored breathing.'
  },
  {
    id: 'chest-pain',
    name: 'Chest Pain',
    description: 'Pain or discomfort in the chest area.'
  }
];

// Sample conditions
export const conditions: Condition[] = [
  {
    id: 'common-cold',
    name: 'Common Cold',
    description: 'A viral infectious disease of the upper respiratory tract that primarily affects the nose.',
    symptoms: ['cough', 'sore-throat', 'fever', 'fatigue'],
    urgencyLevel: 'low',
    recommendedActions: [
      'Rest and stay hydrated',
      'Over-the-counter medications may help with symptoms',
      'Visit a doctor if symptoms persist for more than a week'
    ]
  },
  {
    id: 'flu',
    name: 'Influenza (Flu)',
    description: 'A contagious respiratory illness caused by influenza viruses.',
    symptoms: ['fever', 'cough', 'sore-throat', 'body-ache', 'fatigue', 'headache'],
    urgencyLevel: 'medium',
    recommendedActions: [
      'Rest and stay hydrated',
      'Take fever-reducing medication',
      'Visit a healthcare provider if symptoms are severe'
    ]
  },
  {
    id: 'covid-19',
    name: 'COVID-19',
    description: 'A respiratory illness caused by the SARS-CoV-2 virus.',
    symptoms: ['fever', 'cough', 'shortness-of-breath', 'fatigue', 'body-ache', 'headache', 'sore-throat'],
    urgencyLevel: 'high',
    recommendedActions: [
      'Isolate yourself from others',
      'Get tested for COVID-19',
      'Contact a healthcare provider',
      'Seek emergency care if you experience severe breathing difficulty'
    ]
  },
  {
    id: 'heart-attack',
    name: 'Heart Attack',
    description: 'A serious medical emergency in which the blood supply to the heart is suddenly blocked.',
    symptoms: ['chest-pain', 'shortness-of-breath', 'nausea', 'dizziness'],
    urgencyLevel: 'emergency',
    recommendedActions: [
      'Call emergency services (911) immediately',
      'Chew an aspirin if available',
      'If the person is unconscious, begin CPR'
    ]
  },
  {
    id: 'migraine',
    name: 'Migraine',
    description: 'A primary headache disorder characterized by recurrent headaches that are moderate to severe.',
    symptoms: ['headache', 'nausea', 'dizziness'],
    urgencyLevel: 'medium',
    recommendedActions: [
      'Rest in a quiet, dark room',
      'Apply cold compresses to your head',
      'Take over-the-counter pain medication',
      'Visit a doctor if migraines are frequent or severe'
    ]
  }
];

// Function to analyze symptoms and return possible conditions
export function analyzeSymptoms(selectedSymptoms: string[]): Condition[] {
  if (selectedSymptoms.length === 0) return [];
  
  // Calculate match score for each condition based on symptoms match
  const matchedConditions = conditions
    .map(condition => {
      const matchingSymptoms = condition.symptoms.filter(symptom => 
        selectedSymptoms.includes(symptom)
      );
      
      const score = matchingSymptoms.length / condition.symptoms.length;
      
      return {
        condition,
        score,
        matchCount: matchingSymptoms.length
      };
    })
    .filter(item => item.score > 0 && item.matchCount > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.condition);
  
  return matchedConditions;
} 