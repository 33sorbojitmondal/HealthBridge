// Sample symptom database
export type Symptom = {
  id: string;
  name: string;
  description: string;
};

export type Condition = {
  name: string;
  probability: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
};

// Common symptoms
export const symptoms: Symptom[] = [
  { id: 'headache', name: 'Headache', description: 'Pain in any region of the head.' },
  { id: 'dizziness', name: 'Dizziness', description: 'Feeling lightheaded, unsteady, or faint.' },
  { id: 'blurred-vision', name: 'Blurred Vision', description: 'Lack of sharpness of vision.' },
  { id: 'ear-pain', name: 'Ear Pain', description: 'Pain in the ear canal.' },
  { id: 'fever', name: 'Fever', description: 'Elevated body temperature.' },
  { id: 'chest-pain', name: 'Chest Pain', description: 'Pain or discomfort in the chest area.' },
  { id: 'shortness-of-breath', name: 'Shortness of Breath', description: 'Difficult or labored breathing.' },
  { id: 'cough', name: 'Cough', description: 'Sudden expulsion of air from the lungs.' },
  { id: 'rapid-heartbeat', name: 'Rapid Heartbeat', description: 'Heart beats faster than normal.' },
  { id: 'abdominal-pain', name: 'Abdominal Pain', description: 'Pain in the region between the chest and pelvis.' },
  { id: 'nausea', name: 'Nausea', description: 'Feeling of sickness with an inclination to vomit.' },
  { id: 'vomiting', name: 'Vomiting', description: 'Forceful expulsion of stomach contents.' },
  { id: 'diarrhea', name: 'Diarrhea', description: 'Loose, watery bowel movements.' },
  { id: 'joint-pain', name: 'Joint Pain', description: 'Pain in the joints of the body.' },
  { id: 'body-ache', name: 'Muscle Aches', description: 'Generalized pain in muscles throughout the body.' },
  { id: 'swelling', name: 'Swelling', description: 'Abnormal enlargement of body parts.' },
  { id: 'numbness', name: 'Numbness', description: 'Loss of sensation or feeling.' },
  { id: 'fatigue', name: 'Fatigue', description: 'Extreme tiredness resulting from mental or physical exertion.' },
  { id: 'rash', name: 'Rash', description: 'Eruption of the skin that may cause discoloration, itching, or inflammation.' },
  { id: 'itching', name: 'Itching', description: 'Irritating sensation that causes a desire to scratch.' },
];

// Common medical conditions
export const conditions: Condition[] = [
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
  },
  {
    name: 'Migraine',
    probability: 'medium',
    description: 'A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.',
    recommendation: 'Rest in a quiet, dark room. Use over-the-counter pain relievers. If frequent or severe, consult a healthcare provider for preventive treatments.'
  },
  {
    name: 'Gastroenteritis',
    probability: 'high',
    description: 'Inflammation of the lining of the stomach and intestines, characterized by diarrhea, abdominal cramps, nausea, or vomiting.',
    recommendation: 'Stay hydrated, rest, and eat mild, easily digestible foods. If symptoms persist over 48 hours or are severe, consult a healthcare provider.'
  }
];

// Function to analyze symptoms and return potential conditions
export function analyzeSymptoms(symptomIds: string[]): Condition[] {
  if (symptomIds.includes('headache') && symptomIds.includes('fever')) {
    return conditions.filter(c => 
      ['Common Cold', 'Influenza (Flu)', 'COVID-19'].includes(c.name)
    );
  }
  
  if (symptomIds.includes('headache') && symptomIds.includes('blurred-vision')) {
    return [
      {
        name: 'Migraine',
        probability: 'high',
        description: 'A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.',
        recommendation: 'Rest in a quiet, dark room. Use over-the-counter pain relievers. If frequent or severe, consult a healthcare provider for preventive treatments.'
      }
    ];
  }
  
  // Default response if no specific match
  return [
    {
      name: 'General Health Concern',
      probability: 'medium',
      description: 'Based on your symptoms, there could be various causes ranging from minor to more serious conditions.',
      recommendation: 'If symptoms persist, worsen, or significantly impact your daily activities, consult a healthcare provider for a proper diagnosis.'
    }
  ];
} 