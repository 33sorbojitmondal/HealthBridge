'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Mock health topics data
const HEALTH_TOPICS = [
  {
    id: 1,
    title: 'Heart Health Basics',
    summary: 'Learn about cardiovascular health, common conditions, and prevention strategies.',
    content: `Heart disease is the leading cause of death globally. The heart is a muscular organ that pumps blood throughout the body, supplying oxygen and nutrients. Key heart health factors include blood pressure, cholesterol levels, and lifestyle choices. Regular exercise, a balanced diet low in saturated fats and sodium, avoiding tobacco, limiting alcohol, and managing stress can significantly reduce heart disease risk. Common heart conditions include coronary artery disease, heart failure, arrhythmias, and valve disorders. Warning signs of heart problems include chest pain, shortness of breath, fatigue, irregular heartbeat, and swelling in the legs.`,
    keywords: ['heart', 'cardiovascular', 'blood pressure', 'cholesterol', 'exercise'],
    imageUrl: '/images/heart-health.jpg'
  },
  {
    id: 2,
    title: 'Diabetes Management',
    summary: 'Understanding diabetes types, monitoring blood sugar, and lifestyle adjustments.',
    content: `Diabetes is a chronic condition affecting how your body processes blood sugar. Type 1 diabetes is an autoimmune condition where the pancreas produces little or no insulin. Type 2 diabetes occurs when your body becomes resistant to insulin or doesn't produce enough. Managing diabetes involves monitoring blood glucose levels regularly, taking prescribed medications, following a balanced diet low in simple carbohydrates, regular physical activity, and maintaining a healthy weight. Complications can include heart disease, nerve damage, kidney damage, eye damage, and foot problems. Regular check-ups with healthcare providers are essential for monitoring overall health and adjusting treatment plans as needed.`,
    keywords: ['diabetes', 'blood sugar', 'insulin', 'glucose', 'type 1', 'type 2'],
    imageUrl: '/images/diabetes.jpg'
  },
  {
    id: 3,
    title: 'Mental Health Awareness',
    summary: 'Information on common mental health conditions, coping strategies, and resources.',
    content: `Mental health encompasses emotional, psychological, and social well-being, affecting how we think, feel, and act. Common mental health conditions include depression, anxiety disorders, bipolar disorder, and schizophrenia. Factors contributing to mental health problems include biological factors like genetics and brain chemistry, life experiences such as trauma or abuse, and family history. Maintaining good mental health involves regular exercise, adequate sleep, stress management techniques like meditation, maintaining social connections, and seeking professional help when needed. Warning signs of mental health issues include significant changes in mood, energy, or behavior, difficulty performing daily activities, and thoughts of self-harm. Treatment options include therapy, medication, support groups, and lifestyle changes.`,
    keywords: ['mental health', 'depression', 'anxiety', 'therapy', 'stress'],
    imageUrl: '/images/mental-health.jpg'
  },
  {
    id: 4,
    title: 'Nutrition Fundamentals',
    summary: 'Guidelines for balanced eating, nutrients, and developing healthy eating habits.',
    content: `Good nutrition is essential for overall health and well-being. A balanced diet includes a variety of foods from all food groups: fruits, vegetables, whole grains, lean proteins, and healthy fats. Key nutrients include carbohydrates for energy, proteins for tissue building and repair, fats for hormone production and nutrient absorption, vitamins and minerals for various bodily functions, and water for hydration. The concept of portion control is important—eating the right amount based on your body's needs. Recommended dietary patterns include the Mediterranean diet, DASH diet, and plant-based diets, which are associated with lower risks of chronic diseases. Processed foods, added sugars, excessive sodium, and trans fats should be limited. Personalized nutrition needs vary based on age, sex, activity level, and health conditions.`,
    keywords: ['nutrition', 'diet', 'food', 'nutrients', 'eating'],
    imageUrl: '/images/nutrition.jpg'
  },
  {
    id: 5,
    title: 'Preventive Health Screenings',
    summary: 'Age and gender-appropriate health screenings and preventive measures.',
    content: `Preventive health screenings are medical tests that detect health conditions before symptoms appear, when they're most treatable. Common screenings include blood pressure checks for hypertension, cholesterol tests for heart disease risk, colonoscopies for colorectal cancer, mammograms for breast cancer, Pap tests for cervical cancer, and blood glucose tests for diabetes. Recommended screening schedules vary by age, gender, family history, and risk factors. Immunizations are another crucial preventive measure, protecting against infectious diseases like influenza, pneumonia, shingles, and HPV. Regular dental check-ups and eye exams are also important components of preventive care. Discussing your personal and family medical history with your healthcare provider helps determine which screenings are appropriate for you and when you should have them.`,
    keywords: ['screening', 'prevention', 'checkup', 'immunization', 'cancer'],
    imageUrl: '/images/screenings.jpg'
  }
];

// Simulated voice recognition responses
const MOCK_VOICE_RESPONSES: Record<string, () => {
  topicId?: number;
  section?: string;
  action?: string;
  response: string;
}> = {
  "tell me about heart health": () => ({
    topicId: 1,
    section: 'content',
    response: "I'll tell you about heart health basics."
  }),
  "what is diabetes": () => ({
    topicId: 2,
    section: 'content',
    response: "I'll explain diabetes management."
  }),
  "explain mental health": () => ({
    topicId: 3,
    section: 'content',
    response: "Here's information about mental health awareness."
  }),
  "nutrition information": () => ({
    topicId: 4,
    section: 'content',
    response: "I'll share nutrition fundamentals with you."
  }),
  "preventive screenings": () => ({
    topicId: 5,
    section: 'content',
    response: "Let me tell you about preventive health screenings."
  }),
  "show topics": () => ({
    action: 'showTopics',
    response: "Here are all available health topics."
  }),
  "stop reading": () => ({
    action: 'stopReading',
    response: "I've stopped the audio playback."
  })
};

const HealthEducation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [topics, setTopics] = useState(HEALTH_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<typeof HEALTH_TOPICS[0] | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState(HEALTH_TOPICS);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  
  // Speech synthesis
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechRef.current = new SpeechSynthesisUtterance();
      speechRef.current.lang = 'en-US';
      speechRef.current.rate = 1;
      speechRef.current.pitch = 1;
    }
    
    // Clean up
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  
  // Filter topics based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTopics(topics);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = topics.filter(topic => 
      topic.title.toLowerCase().includes(query) || 
      topic.summary.toLowerCase().includes(query) ||
      topic.keywords.some(keyword => keyword.includes(query))
    );
    
    setFilteredTopics(filtered);
  }, [searchQuery, topics]);
  
  // Simulated voice recognition
  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setFeedback('Listening...');
    
    // Simulate processing time
    setTimeout(() => {
      setIsListening(false);
      
      // Get a random voice command for demo purposes
      const commands = Object.keys(MOCK_VOICE_RESPONSES);
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      
      setTranscript(randomCommand);
      processVoiceCommand(randomCommand);
    }, 2000);
  };
  
  const processVoiceCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Find the closest matching command
    let matchedCommand = '';
    let bestMatchScore = 0;
    
    Object.keys(MOCK_VOICE_RESPONSES).forEach(cmd => {
      if (normalizedCommand.includes(cmd) && cmd.length > bestMatchScore) {
        matchedCommand = cmd;
        bestMatchScore = cmd.length;
      }
    });
    
    if (matchedCommand && MOCK_VOICE_RESPONSES[matchedCommand]) {
      const handler = MOCK_VOICE_RESPONSES[matchedCommand];
      const result = handler();
      
      setFeedback(result.response);
      
      if (result.action === 'showTopics') {
        setSelectedTopic(null);
      } else if (result.action === 'stopReading') {
        stopReading();
      } else if (result.topicId) {
        const topic = topics.find(t => t.id === result.topicId);
        if (topic) {
          setSelectedTopic(topic);
          addToRecentlyViewed(topic.id);
          
          if (result.section === 'content') {
            startReading(topic.content);
          }
        }
      }
    } else {
      setFeedback("I'm sorry, I didn't understand that request. Please try again.");
    }
  };
  
  const startReading = (text: string) => {
    if (!synth || !speechRef.current) return;
    
    // Stop any ongoing speech
    stopReading();
    
    // Set the text and start speaking
    speechRef.current.text = text;
    synth.speak(speechRef.current);
    setIsReading(true);
  };
  
  const stopReading = () => {
    if (!synth) return;
    
    if (synth.speaking) {
      synth.cancel();
    }
    setIsReading(false);
  };
  
  const selectTopic = (topic: typeof HEALTH_TOPICS[0]) => {
    setSelectedTopic(topic);
    addToRecentlyViewed(topic.id);
  };
  
  const addToRecentlyViewed = (topicId: number) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(id => id !== topicId);
      // Add to beginning and limit to 3 items
      return [topicId, ...filtered].slice(0, 3);
    });
  };
  
  const getRecentlyViewedTopics = () => {
    return recentlyViewed.map(id => topics.find(topic => topic.id === id)).filter(Boolean) as typeof HEALTH_TOPICS;
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Voice-Based Health Education</h1>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Voice-Based Health Education</h1>
          <p className="mt-4 text-gray-500">Learn about health topics through interactive voice conversations. Ask questions or browse topics using voice commands or the interface below.</p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search health topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button
                onClick={startListening}
                disabled={isListening}
                className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isListening ? 'bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isListening ? (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10V12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12V10M12 19V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Listening...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10V12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12V10M12 19V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Voice Search
                  </>
                )}
              </button>
            </div>
            
            {transcript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">You said:</p>
                <p className="text-lg font-medium">{transcript}</p>
              </div>
            )}
            
            {feedback && (
              <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                <p className="text-indigo-700">{feedback}</p>
              </div>
            )}
            
            {isReading && (
              <div className="mb-6 flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-md">
                <p className="text-green-700">Reading content aloud...</p>
                <button
                  onClick={stopReading}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Stop Reading
                </button>
              </div>
            )}
          </div>
        </div>
        
        {selectedTopic ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h2>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-500 mb-6">{selectedTopic.summary}</p>
              
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => startReading(selectedTopic.content)}
                  disabled={isReading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.07 5.93C20.9447 7.80528 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Read Aloud
                </button>
              </div>
              
              <div className="prose max-w-none">
                <p>{selectedTopic.content}</p>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Related Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {recentlyViewed.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Viewed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecentlyViewedTopics().map(topic => (
                    <div
                      key={`recent-${topic.id}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectTopic(topic)}
                    >
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{topic.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{topic.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Health Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTopics.length > 0 ? (
                filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => selectTopic(topic)}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{topic.title}</h3>
                      <p className="text-gray-500 mb-4">{topic.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No topics found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Try saying: "Tell me about heart health", "What is diabetes", or "Show topics"</p>
        </div>
      </div>
    </div>
  );
};

export default HealthEducation; 