# CareNavX - Smart Healthcare Onboarding System

A modern, AI-powered hospital patient onboarding system with intelligent health assistance features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB connection

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareNavX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 📋 Available Scripts

- `npm start` - Start the development server
- `npm run dev` - Alternative development server command
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run check` - Run TypeScript type checking

## 🏥 Features

### Core Functionality
- **Patient Onboarding**: Streamlined patient registration process
- **Emergency Fast-Track**: Quick emergency patient registration
- **Medical History Management**: Comprehensive health information tracking
- **Insurance Processing**: Insurance information handling

### AI-Powered Features
- **Health Assistant**: AI-powered symptom analysis and medical advice
- **Smart Chat Support**: Intelligent patient query handling
- **Personalized Recommendations**: Health tips and lifestyle advice
- **Insurance Analysis**: AI-powered insurance guidance

### User Experience
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, intuitive interface
- **Real-time Updates**: Live data synchronization
- **Progress Tracking**: Visual onboarding progress

## 🧠 AI Health Assistant

Access the AI Health Assistant at `/health-assistant` to:

- **Analyze Symptoms**: Get possible conditions and urgency levels
- **Medical Advice**: Receive personalized health recommendations
- **Health Tips**: Get lifestyle and preventive care suggestions

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key for AI features
- `MONGODB_URI`: MongoDB connection string

### Database
The application uses MongoDB for data storage. Make sure your MongoDB instance is running and accessible.

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4 for health assistance
- **State Management**: TanStack Query for server state

## 📁 Project Structure

```
CareNavX/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                 # Backend Node.js application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── openai.ts          # AI service functions
│   └── db.ts              # Database models
└── shared/                 # Shared types and utilities
```

## 🚨 Emergency Features

The system includes special emergency onboarding features:
- **Fast-track registration** for urgent cases
- **Priority processing** with immediate patient ID generation
- **Emergency-specific routing** to appropriate departments

## 🔒 Security & Privacy

- **HIPAA Compliance**: Patient data protection measures
- **Secure API**: Protected endpoints with validation
- **Data Encryption**: Sensitive information encryption
- **Access Control**: Role-based access management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run check`
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Check the Help page in the application
- Review the AI Health Assistant for guidance
- Contact the development team

## 📄 License

MIT License - see LICENSE file for details

---

**CareNavX** - Revolutionizing healthcare onboarding with AI-powered assistance. 