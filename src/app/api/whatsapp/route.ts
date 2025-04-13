import { NextResponse } from 'next/server';

// Mock database of registered users and their health data
const userDatabase: Record<string, any> = {
  '+12345678900': {
    name: 'John Doe',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '8:00 AM' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM' }
    ],
    appointments: [
      { doctor: 'Dr. Smith', specialty: 'Cardiology', date: '2023-11-15', time: '10:00 AM' }
    ],
    community: 'Diabetes Support'
  }
};

// Health education topics
const healthEducationTopics = [
  {
    topic: 'diabetes',
    content: 'Diabetes is a chronic health condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin.'
  },
  {
    topic: 'hypertension',
    content: 'Hypertension, or high blood pressure, is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.'
  },
  {
    topic: 'nutrition',
    content: 'Good nutrition is an important part of leading a healthy lifestyle. Combined with physical activity, your diet can help you to reach and maintain a healthy weight, reduce your risk of chronic diseases, and promote your overall health.'
  }
];

// Process incoming WhatsApp messages
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { from, message, sessionId } = data;
    
    if (!from || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    // Check if user is registered
    const userExists = userDatabase[from] !== undefined;
    
    // Process the message based on content
    const lowerMessage = message.toLowerCase();
    let response: any = {};
    
    // Symptom triage
    if (lowerMessage.includes('symptom') || lowerMessage.includes('feeling') || lowerMessage.includes('pain')) {
      response = {
        type: 'triage',
        message: 'I understand you\'re not feeling well. Please tell me more about your symptoms. When did they start, and on a scale of 1-10, how severe is it?',
        suggestions: ['Headache', 'Fever', 'Nausea', 'Chest Pain']
      };
    } 
    // Medication reminders
    else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('reminder')) {
      if (userExists) {
        response = {
          type: 'medication',
          message: `Here are your medication reminders:\n\n${userDatabase[from].medications.map((med: any) => 
            `${med.name} ${med.dosage} - ${med.frequency} (${med.time})`
          ).join('\n')}`,
          actions: ['Mark as taken', 'Remind me later']
        };
      } else {
        response = {
          type: 'registration',
          message: 'You need to register to access medication reminders. Would you like to register now?',
          actions: ['Register', 'More Information']
        };
      }
    } 
    // Health education
    else if (lowerMessage.includes('information') || lowerMessage.includes('learn') || lowerMessage.includes('education')) {
      const relevantTopics = healthEducationTopics.filter(topic => 
        lowerMessage.includes(topic.topic)
      );
      
      if (relevantTopics.length > 0) {
        response = {
          type: 'education',
          message: relevantTopics[0].content,
          moreInfo: `For more information on ${relevantTopics[0].topic}, visit our health portal.`
        };
      } else {
        response = {
          type: 'education',
          message: 'What health topic would you like to learn about?',
          topics: healthEducationTopics.map(t => t.topic)
        };
      }
    } 
    // Community alerts
    else if (lowerMessage.includes('community') || lowerMessage.includes('group') || lowerMessage.includes('support')) {
      if (userExists && userDatabase[from].community) {
        response = {
          type: 'community',
          message: `You're part of the ${userDatabase[from].community} group. The next virtual meeting is on Friday at 6 PM. Would you like to receive notifications for this group?`,
          actions: ['Enable notifications', 'Disable notifications']
        };
      } else {
        response = {
          type: 'community',
          message: 'Would you like to join a support group? We have groups for diabetes, heart health, mental wellness, and more.',
          groups: ['Diabetes Support', 'Heart Health', 'Mental Wellness', 'Cancer Support']
        };
      }
    }
    // Appointment information
    else if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor')) {
      if (userExists && userDatabase[from].appointments?.length > 0) {
        response = {
          type: 'appointment',
          message: `Your upcoming appointment:\n\n${userDatabase[from].appointments.map((apt: any) => 
            `${apt.doctor} (${apt.specialty}) - ${apt.date} at ${apt.time}`
          ).join('\n')}`,
          actions: ['Reschedule', 'Cancel', 'Confirm']
        };
      } else {
        response = {
          type: 'appointment',
          message: 'You don\'t have any upcoming appointments. Would you like to schedule one?',
          actions: ['Schedule appointment', 'View specialists']
        };
      }
    }
    // Emergency help
    else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('help')) {
      response = {
        type: 'emergency',
        message: 'If this is a medical emergency, please call your local emergency number (like 911) immediately. Do you need us to connect you with emergency services?',
        actions: ['Connect to emergency', 'Speak to a nurse', 'Not an emergency']
      };
    }
    // Default response
    else {
      response = {
        type: 'general',
        message: 'Hello! How can I assist you with your health today? You can ask about symptoms, medications, appointments, or health information.',
        suggestions: ['Check symptoms', 'Medication reminder', 'Health information', 'Community support']
      };
    }
    
    // In a production environment, this would integrate with a WhatsApp Business API provider
    // to send the actual WhatsApp message back to the user
    
    return NextResponse.json({
      success: true,
      from,
      response
    });
    
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to process WhatsApp message' },
      { status: 500 }
    );
  }
} 