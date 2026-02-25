import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonLoading,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonBackButton,
  IonToast
} from '@ionic/react';
import { mic, micOff, send, settingsOutline } from 'ionicons/icons';
import './AIGuide.css';

// GROQ API configuration
const GROQ_API_KEY = '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';
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';  // Active model

type ChatMessage = {
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
};

const suggestedQuestions = [
  'What are the top 5 must-see places in Pasig?',
  'Recommend historical sites near me',
  'Plan a 1-day heritage tour',
  'Find family-friendly spots in Pasig',
];

// Predefined answers for suggested questions (unchanged)
const cannedResponses: Record<string, string> = {
  'what are the top 5 must-see places in pasig?':
    `Here are the top 5 must-see places in Pasig City:\n\n` +
    `1. Pasig City Museum – A heritage house turned museum showcasing the city's history and culture.\n` +
    `2. Rainforest Park – A family-friendly park with a man-made lake, mini zoo, and picnic areas.\n` +
    `3. Kapitan Moy – A historic house and restaurant offering traditional Filipino cuisine.\n` +
    `4. The Podium – A modern shopping mall with upscale shops, dining, and entertainment.\n` +
    `5. Pasig River Esplanade – A scenic riverside walkway perfect for jogging, biking, or relaxing.`,

  'recommend historical sites near me':
    `Here are some historical sites in and around Pasig:\n\n` +
    `- Pasig City Museum (formerly the Concepcion Mansion) – Built in 1937, it offers a glimpse into the city's past.\n` +
    `- San Guillermo Parish Church (Barasoain Church) – A historic church in Malolos, Bulacan (about an hour from Pasig).\n` +
    `- Intramuros – The historic walled area in Manila, with Fort Santiago, San Agustin Church, and colonial architecture.\n` +
    `- Museo ng Katipunan – In San Juan, near Pasig, dedicated to the Philippine Revolution.\n` +
    `- Pinaglabanan Shrine – Also in San Juan, commemorating the first battle of the Philippine Revolution.`,

  'plan a 1-day heritage tour':
    `Here's a suggested 1-day heritage tour entirely within Pasig City:\n\n` +
    `Morning (9:00 AM – 12:00 PM)\n` +
    `- Start at Pasig City Museum (Concepcion Mansion) to learn about local history and culture.\n` +
    `- Visit Kapitan Moy House, one of Pasig's oldest historic homes.\n\n` +
    `Lunch (12:00 – 1:30 PM)\n` +
    `- Eat in Kapitolyo, a neighborhood known for heritage houses and great dining options, or try a local carinderia for authentic Filipino fare.\n\n` +
    `Afternoon (2:00 – 5:00 PM)\n` +
    `- Walk or bike along the Pasig River Esplanade to enjoy riverside views and learn about the area's river heritage.\n` +
    `- Relax at Rainforest Park for green spaces, a small zoo area, and family-friendly activities.\n\n` +
    `Evening (5:30 PM onwards)\n` +
    `- Explore The Podium or Estancia Mall for dinner and shopping, or visit Tiendesitas for native crafts and pasalubong.`,

  'find family-friendly spots in pasig':
    `Here are some family-friendly spots in Pasig:\n\n` +
    `1. Rainforest Park – Has a playground, mini zoo, and paddle boats.\n` +
    `2. Tiendesitas – A shopping village with native products, food stalls, and pet shops.\n` +
    `3. Arcovia City – An open lifestyle mall with a cinema, restaurants, and play areas.\n` +
    `4. The Podium – Features a kids' play area, toy stores, and family-friendly restaurants.\n` +
    `5. Metrowalk – Has a family karaoke bar, bowling alley, and food strip.\n` +
    `6. SM City Pasig – A large mall with a cinema, arcade, and children's play zones.`,
};

// Helper to get canned response if question matches
const getCannedResponse = (question: string): string | null => {
  const normalized = question.trim().toLowerCase();
  for (const [key, answer] of Object.entries(cannedResponses)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return answer;
    }
  }
  return null;
};

const AIGuide: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello! I'm your Pasig AI Guide 👋\nHow can I help you explore today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading] = useState(false);
  const [voiceLanguage] = useState('en-US');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'any' | 'female' | 'male'>('any');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // --- Speech Recognition Setup (unchanged) ---
  useEffect(() => {
    mountedRef.current = true;

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        if (!mountedRef.current) return;
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (!mountedRef.current) return;
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        let userMessage = 'Voice input failed.';
        if (event.error === 'not-allowed') {
          userMessage = 'Microphone permission denied. Please allow access and try again.';
        } else if (event.error === 'no-speech') {
          userMessage = 'No speech detected. Please try again.';
        } else {
          userMessage = `Voice recognition error: ${event.error}`;
        }
        setErrorMessage(userMessage);
        setShowErrorToast(true);
      };

      recognitionRef.current.onend = () => {
        if (mountedRef.current) setIsListening(false);
      };
    }

    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported.');
      return;
    }
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakTextEnhanced = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (voiceGender === 'female') {
        preferredVoice = voices.find(v => /female|zira|susan|karen|hazel|samantha|victoria/i.test(v.name) || /female/i.test(v.voiceURI));
      } else if (voiceGender === 'male') {
        preferredVoice = voices.find(v => /male|david|mark|paul|alex|james|robert/i.test(v.name) || /male/i.test(v.voiceURI));
      } else {
        preferredVoice = voices.find(voice => voice.lang.includes('en') && voice.default);
      }

      if (!preferredVoice) {
        preferredVoice = voices.find(voice => voice.lang.includes('en'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = voiceSpeed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error', event);
        setIsSpeaking(false);
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setErrorMessage('Voice input is not supported in this browser. Please type your question.');
      setShowErrorToast(true);
      return;
    }

    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition not initialized.');
      setShowErrorToast(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setErrorMessage('Could not start voice recognition. Please try again.');
        setShowErrorToast(true);
        setIsListening(false);
      }
    }
  };

  // --- AI Response Generation using GROQ (with limit) ---
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // First check if we have a canned response for this question
    const canned = getCannedResponse(userMessage);
    if (canned) {
      return canned;
    }

    if (!GROQ_API_KEY) {
      return "API key not configured. Please set the Groq API key.";
    }

    try {
      const prompt = `You are an AI tourism guide for Pasig City, Philippines.
Provide helpful, accurate, and engaging information about Pasig City.

User question: ${userMessage}

IMPORTANT: Keep your answer VERY SHORT – maximum 2-3 sentences.
Be direct and concise.

Response:`;

      const requestBody = {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful tourism guide for Pasig City. Always answer briefly in 2-3 sentences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,  // Slightly lower for more focused answers
        max_tokens: 150,    // Hard limit to prevent long responses
        top_p: 0.9,
        stream: false
      };

      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GROQ API error response:', errorText);
        throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('GROQ API response:', data);

      // Extract the assistant's reply (OpenAI-compatible format)
      const aiText = data.choices?.[0]?.message?.content;
      if (aiText) {
        return aiText;
      } else {
        console.warn('Unexpected response format:', data);
        return "I received an unexpected response format. Please try again.";
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        return "Invalid API key. Please check your configuration.";
      }
      return "I apologize, but I'm having trouble connecting to the information service. Please try again or ask another question about Pasig City!";
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setInput('');

    try {
      const aiResponse = await generateAIResponse(text);
      if (!mountedRef.current) return;

      const aiMessage: ChatMessage = {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      speakTextEnhanced(aiResponse);
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);
      if (mountedRef.current) {
        const errorMessage: ChatMessage = {
          text: "Sorry, an unexpected error occurred. Please try again.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setErrorMessage('Failed to get AI response. Check your connection.');
        setShowErrorToast(true);
      }
    } finally {
      if (mountedRef.current) {
        setIsTyping(false);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader className="ai-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/Home" />
          </IonButtons>
          <IonTitle>
            <div className="title">AI Pasig Guide</div>
            <div className="subtitle">Assistant for Pasig City</div>
          </IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => setShowSettings(true)}>
            <IonIcon icon={settingsOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonModal isOpen={showSettings} onDidDismiss={() => setShowSettings(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Settings</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowSettings(false)}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel>Mute</IonLabel>
              <IonToggle checked={isMuted} onIonChange={e => {
                const val = e.detail.checked;
                setIsMuted(val);
                if (val) stopSpeaking();
              }} />
            </IonItem>

            <IonItem>
              <IonLabel>Voice Gender</IonLabel>
              <IonSelect value={voiceGender} onIonChange={e => setVoiceGender(e.detail.value)}>
                <IonSelectOption value="any">Any</IonSelectOption>
                <IonSelectOption value="male">Male</IonSelectOption>
                <IonSelectOption value="female">Female</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>

      <IonContent className="chat-content">
        <IonLoading isOpen={loading} message="Generating response..." />
        
        <div className="chat-area">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message-container ${msg.sender === 'ai' ? 'ai' : 'user'}`}
            >
              {msg.sender === 'ai' && (
                <img src="/assets/images/AI/ALI 2.png" alt="AI Profile" className="profile-img" />
              )}
              <div
                className={`bubble ${msg.sender === 'ai' ? 'ai' : 'user'}`}
                onClick={msg.sender === 'ai' ? () => speakTextEnhanced(msg.text) : undefined}
                style={msg.sender === 'ai' ? { cursor: 'pointer' } : undefined}
              >
                {msg.text}
                <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="suggestions">
              <p className="suggest-title">Suggested Questions</p>
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="message-container ai">
              <img src="/assets/images/AI/ALI 2.png" alt="AI Profile" className="profile-img" />
              <div className="bubble ai typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <button
            className="icon-btn"
            onClick={toggleListening}
            style={{ color: isListening ? '#ef4444' : '#2563eb' }}
            aria-label="Toggle voice input"
          >
            <IonIcon icon={isListening ? micOff : mic} />
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question or tap mic..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
          />

          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <IonIcon icon={send} />
          </button>
        </div>

        <IonToast
          isOpen={showErrorToast}
          onDidDismiss={() => setShowErrorToast(false)}
          message={errorMessage || 'An error occurred'}
          duration={4000}
          color="danger"
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AIGuide;