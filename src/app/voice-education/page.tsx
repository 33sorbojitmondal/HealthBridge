"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Types for education content
interface EducationContent {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  lastUpdated: string;
  sourceUrl?: string;
  sourceName?: string;
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  isProcessing: boolean;
  error: string | null;
}

// Sample health education content
const HEALTH_EDUCATION_CONTENT: EducationContent[] = [
  {
    id: '1',
    title: 'Understanding Blood Pressure',
    category: 'Heart Health',
    summary: 'Learn about blood pressure readings, what they mean, and how to maintain healthy levels.',
    content: `Blood pressure is measured using two numbers: systolic (pressure when heart beats) and diastolic (pressure when heart rests). 
    A normal blood pressure is less than 120/80 mm Hg. 
    High blood pressure (hypertension) is when readings consistently range from 130 or higher for systolic or 80 or higher for diastolic. 
    Low blood pressure (hypotension) is generally considered a reading lower than 90/60 mm Hg.
    
    You can maintain healthy blood pressure through regular exercise, a balanced diet low in sodium, maintaining a healthy weight, limiting alcohol consumption, avoiding tobacco, managing stress, and getting regular check-ups.`,
    lastUpdated: '2023-10-15',
    sourceUrl: 'https://www.heart.org/en/health-topics/high-blood-pressure',
    sourceName: 'American Heart Association'
  },
  {
    id: '2',
    title: 'Diabetes Management Basics',
    category: 'Diabetes',
    summary: 'Essential information on managing diabetes, monitoring blood sugar, and preventing complications.',
    content: `Diabetes management focuses on keeping blood glucose levels as close to target range as possible. This involves:
    
    1. Regular blood glucose monitoring
    2. Taking medications as prescribed
    3. Following a balanced meal plan
    4. Regular physical activity
    5. Managing stress
    
    Monitoring should include regular A1C tests (averaging blood sugar over 2-3 months), which should ideally be below 7% for most adults with diabetes.
    
    Complications can affect the heart, kidneys, eyes, and nerves, but good management significantly reduces these risks.`,
    lastUpdated: '2023-11-20',
    sourceUrl: 'https://www.diabetes.org/diabetes',
    sourceName: 'American Diabetes Association'
  },
  {
    id: '3',
    title: 'COVID-19 Prevention Strategies',
    category: 'Infectious Disease',
    summary: 'Current recommendations for preventing COVID-19 infection and understanding vaccination.',
    content: `Prevention strategies for COVID-19 include:
    
    1. Staying up-to-date with recommended vaccines
    2. Improving ventilation
    3. Getting tested if you have symptoms
    4. Wearing masks in high-risk situations
    5. Staying home when sick
    6. Practicing good hand hygiene
    
    Vaccines remain the most effective tool to protect against severe illness, hospitalization, and death. Even if you've had COVID-19, vaccination provides additional protection.
    
    If you test positive, follow isolation recommendations and consult with a healthcare provider about treatment options if you're at risk for severe disease.`,
    lastUpdated: '2023-12-05',
    sourceUrl: 'https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/prevention.html',
    sourceName: 'Centers for Disease Control and Prevention'
  },
  {
    id: '4',
    title: 'Mental Health First Aid',
    category: 'Mental Health',
    summary: 'How to recognize signs of mental health challenges and provide initial support.',
    content: `Mental Health First Aid involves the "ALGEE" action plan:
    
    A - Assess for risk of suicide or harm
    L - Listen non-judgmentally
    G - Give reassurance and information
    E - Encourage appropriate professional help
    E - Encourage self-help and other support strategies
    
    Common signs someone may be experiencing a mental health challenge include:
    - Changes in mood, behavior, or personality
    - Social withdrawal
    - Problems with concentration or memory
    - Changes in sleep or appetite
    - Increased sensitivity to sensory stimuli
    
    If you or someone you know is in crisis, contact the 988 Suicide & Crisis Lifeline by calling or texting 988.`,
    lastUpdated: '2023-09-30',
    sourceUrl: 'https://www.mentalhealthfirstaid.org',
    sourceName: 'Mental Health First Aid'
  },
  {
    id: '5',
    title: 'Nutrition Fundamentals',
    category: 'Nutrition',
    summary: 'Basic principles of healthy eating and balanced nutrition.',
    content: `A healthy eating pattern includes:
    
    1. A variety of vegetables
    2. Fruits, especially whole fruits
    3. Grains, at least half of which are whole grains
    4. Fat-free or low-fat dairy
    5. A variety of protein foods
    6. Oils
    
    It's recommended to limit saturated fats, trans fats, added sugars, and sodium. The Dietary Guidelines for Americans suggests limiting:
    - Added sugars to less than 10% of calories per day
    - Saturated fats to less than 10% of calories per day
    - Sodium to less than 2,300 mg per day
    
    Portion control is also important - even healthy foods can contribute to weight gain when consumed in excess.`,
    lastUpdated: '2023-08-15',
    sourceUrl: 'https://www.myplate.gov',
    sourceName: 'USDA MyPlate'
  }
];

// Mock API functions
const searchHealthTopics = (query: string): Promise<EducationContent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve([]);
        return;
      }
      
      // Simple search in title, category, and content
      const results = HEALTH_EDUCATION_CONTENT.filter(
        content => 
          content.title.toLowerCase().includes(query.toLowerCase()) ||
          content.category.toLowerCase().includes(query.toLowerCase()) ||
          content.content.toLowerCase().includes(query.toLowerCase())
      );
      
      resolve(results);
    }, 500);
  });
};

const processVoiceQuery = (transcript: string): Promise<{response: string, relatedContent: EducationContent[]}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would be an actual API call to a voice processing service
      // For now, we'll use a simple keyword matching system
      
      let response = "I didn't find specific information about that. Please try asking about blood pressure, diabetes, COVID-19, mental health, or nutrition.";
      
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('blood pressure')) {
        response = "Blood pressure is measured using two numbers: systolic and diastolic. A normal blood pressure is less than 120/80 mm Hg. You can maintain healthy blood pressure through regular exercise, a balanced diet low in sodium, maintaining a healthy weight, limiting alcohol, avoiding tobacco, and managing stress.";
      } else if (lowerTranscript.includes('diabetes')) {
        response = "Diabetes management focuses on keeping blood glucose levels in target range through monitoring, medications, balanced meals, physical activity, and stress management. Regular A1C tests should ideally show levels below 7% for most adults.";
      } else if (lowerTranscript.includes('covid') || lowerTranscript.includes('coronavirus')) {
        response = "COVID-19 prevention includes staying up-to-date with vaccines, improving ventilation, testing when symptomatic, wearing masks in high-risk situations, staying home when sick, and practicing good hand hygiene. Vaccines remain the most effective protection against severe illness.";
      } else if (lowerTranscript.includes('mental health')) {
        response = "Mental Health First Aid involves assessing risk, listening non-judgmentally, giving reassurance and information, encouraging professional help, and supporting self-help strategies. If in crisis, contact the 988 Suicide & Crisis Lifeline by calling or texting 988.";
      } else if (lowerTranscript.includes('nutrition') || lowerTranscript.includes('diet') || lowerTranscript.includes('food')) {
        response = "Healthy eating includes a variety of vegetables, fruits, whole grains, low-fat dairy, and protein foods. Limit saturated fats, trans fats, added sugars, and sodium. Practice portion control, as even healthy foods can lead to weight gain when consumed in excess.";
      }
      
      // Find related content
      searchHealthTopics(transcript).then(relatedContent => {
        resolve({
          response,
          relatedContent
        });
      });
    }, 1000);
  });
};

// Speech synthesis utility
const speak = (text: string, rate = 1, pitch = 1) => {
  if (!window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  
  // Get voices
  let voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // If voices aren't loaded yet, wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      // Try to find a female voice for the health assistant
      const femaleVoice = voices.find(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK English Female')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    };
  } else {
    // Try to find a female voice for the health assistant
    const femaleVoice = voices.find(voice => 
      voice.name.includes('female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google UK English Female')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  }
};

export default function VoiceEducationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [featuredContent, setFeaturedContent] = useState<EducationContent[]>([]);
  const [searchResults, setSearchResults] = useState<EducationContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null);
  const [response, setResponse] = useState('');
  
  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isProcessing: false,
    error: null
  });
  
  // References
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/voice-education');
    }
  }, [status, router]);
  
  useEffect(() => {
    if (status === 'authenticated') {
      // Load featured content
      setFeaturedContent(HEALTH_EDUCATION_CONTENT.slice(0, 3));
      setLoading(false);
      
      // Initialize speech recognition if available
      if (window && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setVoiceState(prev => ({
            ...prev,
            transcript
          }));
        };
        
        recognitionRef.current.onerror = (event: any) => {
          setVoiceState(prev => ({
            ...prev,
            isListening: false,
            error: `Speech recognition error: ${event.error}`
          }));
        };
        
        recognitionRef.current.onend = () => {
          setVoiceState(prev => {
            // Only process if we were actively listening
            if (prev.isListening) {
              handleProcessVoiceQuery(prev.transcript);
            }
            return {
              ...prev,
              isListening: false
            };
          });
        };
      }
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, [status]);
  
  // Handle text search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchHealthTopics(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching health topics:', error);
    }
    setLoading(false);
  };
  
  // Handle voice commands
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Speech recognition not supported in your browser'
      }));
      return;
    }
    
    if (voiceState.isListening) {
      recognitionRef.current.stop();
      setVoiceState(prev => ({
        ...prev,
        isListening: false
      }));
    } else {
      setVoiceState({
        isListening: true,
        transcript: '',
        isProcessing: false,
        error: null
      });
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setVoiceState({
          isListening: false,
          transcript: '',
          isProcessing: false,
          error: 'Could not start speech recognition'
        });
      }
    }
  };
  
  // Process voice query
  const handleProcessVoiceQuery = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setVoiceState(prev => ({
      ...prev,
      isProcessing: true
    }));
    
    try {
      const { response, relatedContent } = await processVoiceQuery(transcript);
      setResponse(response);
      setSearchResults(relatedContent);
      
      // Read response aloud
      speak(response);
    } catch (error) {
      console.error('Error processing voice query:', error);
      setVoiceState(prev => ({
        ...prev,
        error: 'Error processing your question'
      }));
    }
    
    setVoiceState(prev => ({
      ...prev,
      isProcessing: false
    }));
  };
  
  const handleContentSelection = (content: EducationContent) => {
    setSelectedContent(content);
    // Read the content summary aloud
    speak(`${content.title}. ${content.summary}`);
  };
  
  const readFullContent = () => {
    if (selectedContent) {
      speak(selectedContent.content);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Voice Health Education</h1>
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Voice Health Education</h1>
        <p className="text-gray-600 mt-2">
          Ask health questions by voice and get spoken answers, or browse our health education library.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Ask Health Questions</h2>
            
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg mb-6">
              <button
                onClick={toggleListening}
                disabled={voiceState.isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  voiceState.isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <p className="text-center text-lg font-medium mb-2">
                {voiceState.isListening 
                  ? "I'm listening..." 
                  : voiceState.isProcessing 
                    ? "Processing your question..." 
                    : "Tap to ask a question"}
              </p>
              
              {voiceState.transcript && (
                <div className="w-full p-3 bg-white rounded border border-gray-300 mb-4">
                  <p className="text-gray-800">{voiceState.transcript}</p>
                </div>
              )}
              
              {voiceState.error && (
                <div className="w-full p-3 bg-red-50 rounded border border-red-300 text-red-700 mb-4">
                  {voiceState.error}
                </div>
              )}
              
              {response && (
                <div className="w-full mt-4">
                  <h3 className="text-lg font-medium mb-2">Response:</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-800">{response}</p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => speak(response)}
                      className="text-primary hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Repeat Response
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Or search by text:</h3>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search health topics..."
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="bg-primary text-white p-2 rounded-r-md hover:bg-primary-dark"
                >
                  Search
                </button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Search Results:</h3>
                <div className="space-y-4">
                  {searchResults.map((content) => (
                    <div
                      key={content.id}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleContentSelection(content)}
                    >
                      <h4 className="text-lg font-medium text-primary">{content.title}</h4>
                      <p className="text-sm text-gray-500">{content.category}</p>
                      <p className="mt-2">{content.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {selectedContent ? (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedContent.title}</h2>
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {selectedContent.category}
                </span>
                <p className="text-sm text-gray-500 mt-1">Last updated: {selectedContent.lastUpdated}</p>
              </div>
              
              <p className="font-medium mb-4">{selectedContent.summary}</p>
              
              <div className="whitespace-pre-line mb-4">
                {selectedContent.content}
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={readFullContent}
                  className="flex items-center text-primary hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Read Aloud
                </button>
                
                {selectedContent.sourceUrl && (
                  <a
                    href={selectedContent.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Source: {selectedContent.sourceName}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Featured Health Topics</h2>
              <div className="space-y-4">
                {featuredContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleContentSelection(content)}
                  >
                    <h4 className="font-medium text-primary">{content.title}</h4>
                    <p className="text-sm text-gray-500">{content.category}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/health-library" className="text-primary hover:underline">
                  Browse full health library →
                </Link>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Health Education Options</h2>
            <div className="space-y-3">
              <Link href="/health-videos" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Video Library</h3>
                  <p className="text-sm text-gray-600">Watch health education videos</p>
                </div>
              </Link>
              
              <Link href="/health-podcasts" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Health Podcasts</h3>
                  <p className="text-sm text-gray-600">Listen to health topics on the go</p>
                </div>
              </Link>
              
              <Link href="/interactive-courses" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Interactive Courses</h3>
                  <p className="text-sm text-gray-600">Self-paced health education courses</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 