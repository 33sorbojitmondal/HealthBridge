# AI HealthBridge: Localized Health Assistant for Underserved Communities

## 🌟 Project Overview

AI HealthBridge is a web-based AI platform that offers community-level healthcare assistance to underserved and rural areas, focusing on:

- Symptom-based preliminary diagnosis
- Local language support via NLP
- Community health education
- Connecting patients to the nearest verified healthcare providers or government schemes

## 🔍 Problem Statement

Access to basic healthcare information and early diagnostics is limited in rural or underserved communities due to a lack of healthcare professionals, awareness, and infrastructure. AI HealthBridge aims to bridge this gap using technology.

## 🚀 Key Features

### 1. Symptom Checker
- Users input symptoms in regional languages
- AI model offers likely conditions and urgency level
- Suggests next steps (visit clinic, emergency, etc.)

### 2. Community Health Forum
- Local people ask health-related questions
- Verified professionals can answer
- Moderation via AI to prevent misinformation

### 3. Health Campaign Alert System
- Notifies users of vaccination drives, check-up camps, or disease outbreaks in their area

### 4. Medical Directory
- Interactive map to find healthcare providers near the user's location
- Detailed doctor profiles with ratings, specialties, and availability
- AI-powered doctor evaluations for trusted recommendations
- Filter by specialty, location, and acceptance of new patients

### 5. Health Tracking
- Visual dashboards to monitor health metrics over time
- Support for tracking blood pressure, heart rate, weight, and more
- Goal setting and progress visualization
- Personalized health insights based on tracked data

### 6. Social Health Sharing
- Connect with family members, caregivers, and healthcare providers
- Granular permission controls for sharing health data
- Real-time health updates with selected connections
- Emergency contact management

### 7. Doctor Ratings and Reviews
- Find trusted healthcare providers through community reviews
- AI analysis of doctor strengths and areas for improvement
- Verified patient reviews for authenticity

### 8. Offline Mode (Planned Feature)
- Critical features cached for offline use in areas with limited connectivity

## 💻 Tech Stack

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Node.js + Express (planned)
- **AI Model**: Trained using symptom-disease mapping datasets
- **Language Model**: Fine-tuned transformer (for regional NLP)
- **Database**: MongoDB (planned)
- **Localization**: i18n libraries for localization
- **Maps**: Leaflet for interactive healthcare provider maps
- **Charts**: SVG-based health data visualization
- **Authentication**: NextAuth.js with Google OAuth provider

## 🌈 Why It's Unique

- Targets real-world rural needs with AI + community engagement
- Supports regional language input
- Brings healthcare awareness + accessibility to the grassroots level
- Social health sharing features promote family and community involvement
- Interactive maps make finding appropriate healthcare providers intuitive
- Scalable and adaptable for different regions globally

## 🛠️ Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/ai-healthbridge.git

# Navigate to the project directory
cd ai-healthbridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit the .env.local file with your Google OAuth credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Authentication Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set Application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
8. Copy the generated Client ID and Client Secret
9. Add them to your `.env.local` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## 📱 Feature Highlights

### Health Tracking Dashboard
Track multiple health metrics through an intuitive dashboard with visual charts and progress indicators. Set health goals and monitor your progress over time.

### Interactive Doctor Finder
Find healthcare providers near you with our interactive map feature. Filter by specialty, read reviews, and view AI-generated evaluations to make informed decisions.

### Social Health Network
Share your health journey with trusted family members, friends, and healthcare providers. Control exactly what data is shared and with whom through granular permission settings.

### Emergency Contacts
Designate emergency contacts who can receive critical health updates in urgent situations. Set up automatic notifications for significant health events.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
