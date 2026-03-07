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
import { 
  mic, micOff, send, settingsOutline, search, 
  location, star, map, close, volumeHighOutline,
  pauseCircleOutline, playCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AIGuide.css';

// GROQ API configuration
const GROQ_API_KEY = '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';
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

type ChatMessage = {
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  places?: PlaceSuggestion[];
};

type PlaceSuggestion = {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  type: string;
  category: 'historical' | 'food' | 'park' | 'religious' | 'shopping' | 'entertainment' | 'museum' | 'church' | 'restaurant' | 'mall';
  tags: string[];
};

// Sample place data with correct image paths
const samplePlaces: PlaceSuggestion[] = [
  {
    id: '1',
    title: 'Pasig City Museum',
    image: '/assets/images/destinations/pasig-museum.jpg',
    rating: 4.5,
    reviews: 128,
    distance: '1.2 km',
    address: 'Caruncho Ave, Pasig City',
    type: 'Historical Museum',
    category: 'museum',
    tags: ['historical', 'museum', 'culture', 'heritage', 'history', 'educational']
  },
  {
    id: '2',
    title: 'Rainforest Park',
    image: '/assets/images/destinations/rainforest-park.jpg',
    rating: 4.3,
    reviews: 256,
    distance: '2.5 km',
    address: 'Marcos Hwy, Pasig City',
    type: 'Nature Park',
    category: 'park',
    tags: ['park', 'nature', 'family', 'kids', 'outdoor', 'relaxation', 'picnic', 'zoo']
  },
  {
    id: '3',
    title: 'Pasig Cathedral',
    image: '/assets/images/destinations/pasig-cathedral.jpg',
    rating: 4.7,
    reviews: 342,
    distance: '0.8 km',
    address: 'Caballero St, Pasig City',
    type: 'Church',
    category: 'church',
    tags: ['church', 'religious', 'cathedral', 'spiritual', 'mass', 'prayer']
  },
  {
    id: '4',
    title: 'Kapitolyo',
    image: '/assets/images/destinations/kapitolyo.jpg',
    rating: 4.6,
    reviews: 567,
    distance: '1.5 km',
    address: 'Kapitolyo, Pasig City',
    type: 'Food District',
    category: 'food',
    tags: ['food', 'restaurant', 'dining', 'eat', 'cafe', 'restaurants', 'kainan', 'food trip']
  },
  {
    id: '5',
    title: 'Tiendesitas',
    image: '/assets/images/destinations/tiendesitas.jpg',
    rating: 4.4,
    reviews: 432,
    distance: '2.8 km',
    address: 'Ortigas Ave, Pasig City',
    type: 'Shopping Village',
    category: 'shopping',
    tags: ['shopping', 'mall', 'market', 'pasalubong', 'souvenir', 'native products']
  },
  {
    id: '6',
    title: 'The Podium',
    image: '/assets/images/destinations/podium.jpg',
    rating: 4.5,
    reviews: 678,
    distance: '3.2 km',
    address: 'Ortigas Center, Pasig City',
    type: 'Shopping Mall',
    category: 'mall',
    tags: ['mall', 'shopping', 'dining', 'cinema', 'restaurants', 'stores']
  },
  {
    id: '7',
    title: 'Pasig River Esplanade',
    image: '/assets/images/destinations/esplanade.jpg',
    rating: 4.3,
    reviews: 189,
    distance: '1.0 km',
    address: 'Pasig River, Pasig City',
    type: 'Scenic Spot',
    category: 'park',
    tags: ['scenic', 'walk', 'jog', 'river', 'sunset', 'relaxation', 'outdoor']
  },
  {
    id: '8',
    title: 'Cafe Agapito',
    image: '/assets/images/destinations/cafe-agapito.jpg',
    rating: 4.6,
    reviews: 234,
    distance: '1.8 km',
    address: 'Kapitolyo, Pasig City',
    type: 'Cafe',
    category: 'food',
    tags: ['cafe', 'coffee', 'food', 'dessert', 'pastry', 'breakfast']
  }
];

// Fallback image
const FALLBACK_IMAGE = '/assets/images/placeholder.jpg';

const suggestedQuestions = [
  'What are the top 5 must-see places in Pasig?',
  'Recommend historical sites near me',
  'Where can I eat the best food in Pasig?',
  'Find family-friendly spots in Pasig',
  'What churches can I visit?',
  'Suggest parks for relaxation',
  'Where to go shopping?'
];

const AIGuide: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
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
  const [isPaused, setIsPaused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [loading] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'any' | 'female' | 'male'>('any');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [pausedMessageId, setPausedMessageId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Get user profile picture from localStorage or use default
  const userProfilePic = localStorage.getItem('profilePic') || '/assets/images/Temporary.png';

  // Handle image error
  const handleImageError = (placeId: string) => {
    setImageErrors(prev => new Set(prev).add(placeId));
  };

  // Speech Recognition Setup
  useEffect(() => {
    mountedRef.current = true;

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        if (!mountedRef.current) return;
        
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        setInput(transcript);
        
        if (lastResult.isFinal) {
          sendMessage(transcript);
          setIsListening(false);
          setShowVoiceIndicator(false);
        }
      };

      recognitionRef.current.onstart = () => {
        if (!mountedRef.current) return;
        setShowVoiceIndicator(true);
        setIsListening(true);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (!mountedRef.current) return;
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setShowVoiceIndicator(false);
        
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
        if (mountedRef.current) {
          setIsListening(false);
          setShowVoiceIndicator(false);
        }
      };
    }

    return () => {
      mountedRef.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isThinking, isSearching]);

  // Check if place suggestions are needed based on user query
  const shouldShowPlaceSuggestions = (userQuery: string): boolean => {
    const query = userQuery.toLowerCase();
    
    // Keywords that indicate user is asking for place recommendations
    const placeKeywords = [
      'where', 'place', 'spot', 'location', 'go', 'visit', 'see',
      'recommend', 'suggest', 'find', 'looking for', 'show',
      'museum', 'park', 'church', 'restaurant', 'cafe', 'mall',
      'eat', 'food', 'shop', 'historical', 'heritage', 'tour'
    ];
    
    return placeKeywords.some(keyword => query.includes(keyword));
  };

  // Extract place suggestions only when relevant
  const extractPlaceSuggestions = (userQuery: string, aiResponse: string): PlaceSuggestion[] => {
    // Only show suggestions if the query is about places
    if (!shouldShowPlaceSuggestions(userQuery)) {
      return [];
    }

    const query = userQuery.toLowerCase();
    const response = aiResponse.toLowerCase();
    let suggestions: PlaceSuggestion[] = [];
    let matchedCategories = new Set<string>();

    // Define keyword categories
    const categories = {
      historical: ['historical', 'history', 'heritage', 'museum', 'culture', 'old'],
      museum: ['museum', 'exhibit', 'gallery', 'artifacts'],
      church: ['church', 'cathedral', 'religious', 'spiritual', 'mass', 'prayer'],
      food: ['food', 'restaurant', 'eat', 'cafe', 'dining', 'kainan', 'coffee', 'meal'],
      park: ['park', 'nature', 'outdoor', 'garden', 'relax', 'picnic', 'walk'],
      shopping: ['shop', 'mall', 'buy', 'shopping', 'store', 'market'],
      family: ['family', 'kids', 'children', 'child-friendly']
    };

    // Check for matches
    Object.entries(categories).forEach(([category, keywords]) => {
      const matchesQuery = keywords.some(keyword => query.includes(keyword));
      const matchesResponse = keywords.some(keyword => response.includes(keyword));
      
      if (matchesQuery || matchesResponse) {
        matchedCategories.add(category);
      }
    });

    // Handle "top" or "best" queries
    if (query.includes('top') || query.includes('best') || query.includes('must-see') || query.includes('famous')) {
      suggestions = [...samplePlaces].sort((a, b) => b.rating - a.rating).slice(0, 4);
    } 
    // Handle category matches
    else if (matchedCategories.size > 0) {
      matchedCategories.forEach(category => {
        const categoryPlaces = samplePlaces.filter(place => 
          place.category === category || place.tags.some(tag => tag === category)
        );
        suggestions.push(...categoryPlaces);
      });

      // Remove duplicates
      const uniqueIds = new Set();
      suggestions = suggestions.filter(place => {
        if (uniqueIds.has(place.id)) return false;
        uniqueIds.add(place.id);
        return true;
      });
    } 
    // Handle general recommendations
    else if (query.includes('recommend') || query.includes('suggest') || query.includes('where')) {
      suggestions = samplePlaces.slice(0, 4);
    }

    // Limit to 3 suggestions max and only if there are matches
    return suggestions.length > 0 ? suggestions.slice(0, 3) : [];
  };

  // Generate AI Response using GROQ
  const generateAIResponse = async (userMessage: string): Promise<{text: string, places: PlaceSuggestion[]}> => {
    setIsSearching(true);
    setIsThinking(true);

    try {
      if (!GROQ_API_KEY) {
        return {
          text: "API key not configured. Please set the Groq API key.",
          places: []
        };
      }

      // Simulate thinking
      await new Promise(resolve => setTimeout(resolve, 800));

      const prompt = `You are an AI tourism guide for Pasig City, Philippines.
Provide helpful, accurate, and engaging information about Pasig City.

User question: ${userMessage}

IMPORTANT: 
1. Keep your answer VERY SHORT – maximum 2-3 sentences.
2. If suggesting places, mention them clearly.
3. Be direct and concise.

Response:`;

      const requestBody = {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful tourism guide for Pasig City. Always answer briefly in 2-3 sentences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 150,
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
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content;

      if (aiText) {
        // Extract place suggestions only if relevant
        const places = extractPlaceSuggestions(userMessage, aiText);
        
        return {
          text: aiText,
          places
        };
      }

      return {
        text: "I received an unexpected response. Please try again.",
        places: []
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: "I apologize, but I'm having trouble connecting. Please try again.",
        places: []
      };
    } finally {
      setIsSearching(false);
      setIsThinking(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || isThinking || isSearching) return;

    // Stop any ongoing speech
    stopSpeaking();

    const userMessage: ChatMessage = {
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsSearching(true);
    setIsThinking(true);
    setInput('');

    try {
      const { text: aiText, places } = await generateAIResponse(text);
      
      if (!mountedRef.current) return;

      const aiMessage: ChatMessage = {
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
        places
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak if not muted
      if (!isMuted) {
        const messageIndex = messages.length + 1;
        speakMessage(aiText, messageIndex);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
        setIsSearching(false);
        setIsThinking(false);
      }
    }
  };

  const speakMessage = (text: string, messageIndex: number) => {
    if (isMuted || !window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (voiceGender === 'female') {
        preferredVoice = voices.find(v => /female|zira|susan|karen|hazel|samantha|victoria/i.test(v.name));
      } else if (voiceGender === 'male') {
        preferredVoice = voices.find(v => /male|david|mark|paul|alex|james|robert/i.test(v.name));
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

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeakingMessageId(messageIndex);
        setPausedMessageId(null);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
        setPausedMessageId(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
        setPausedMessageId(null);
      };

      utterance.onpause = () => {
        setIsSpeaking(false);
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingMessageId(null);
      setPausedMessageId(null);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingMessageId(null);
      setPausedMessageId(null);
    }
  };

  const togglePlayPause = (messageIndex: number) => {
    if (!window.speechSynthesis) return;

    // If this message is currently speaking or paused
    if (speakingMessageId === messageIndex || pausedMessageId === messageIndex) {
      if (window.speechSynthesis.paused) {
        // Resume if paused
        window.speechSynthesis.resume();
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeakingMessageId(messageIndex);
        setPausedMessageId(null);
      } else if (window.speechSynthesis.speaking) {
        // Pause if speaking
        window.speechSynthesis.pause();
        setIsSpeaking(false);
        setIsPaused(true);
        setSpeakingMessageId(null);
        setPausedMessageId(messageIndex);
      }
    } else {
      // Different message clicked - speak this one
      const message = messages[messageIndex];
      if (message && message.sender === 'ai') {
        stopSpeaking();
        speakMessage(message.text, messageIndex);
      }
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setErrorMessage('Voice input is not supported in this browser.');
      setShowErrorToast(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setShowVoiceIndicator(false);
    } else {
      try {
        setInput('');
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setErrorMessage('Could not start voice recognition.');
        setShowErrorToast(true);
      }
    }
  };

  const handlePlaceClick = (place: PlaceSuggestion) => {
    stopSpeaking();
    history.push(`/destination/${place.id}`, place);
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setShowVoiceIndicator(false);
      setIsListening(false);
    }
  };

  const handleMessageClick = (msg: ChatMessage, index: number) => {
    if (msg.sender === 'ai') {
      togglePlayPause(index);
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

      {/* Voice Input Indicator */}
      {showVoiceIndicator && (
        <div className="voice-indicator">
          <div className="voice-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span className="voice-text">Listening...</span>
          <button className="voice-stop-btn" onClick={stopVoiceInput}>
            <IonIcon icon={close} />
          </button>
        </div>
      )}

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
              <IonLabel>Mute Voice</IonLabel>
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

            <IonItem>
              <IonLabel>Voice Speed</IonLabel>
              <IonSelect value={voiceSpeed} onIonChange={e => setVoiceSpeed(e.detail.value)}>
                <IonSelectOption value="0.8">Slow</IonSelectOption>
                <IonSelectOption value="1.0">Normal</IonSelectOption>
                <IonSelectOption value="1.2">Fast</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>

      <IonContent className="chat-content">
        <IonLoading isOpen={loading} message="Generating response..." />
        
        <div className="chat-area">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`message-container ${msg.sender === 'ai' ? 'ai' : 'user'}`}>
                {msg.sender === 'ai' && (
                  <img 
                    src="/assets/images/AI/ALI 2.png" 
                    alt="AI" 
                    className="profile-img" 
                  />
                )}
                
                <div
                  className={`bubble ${msg.sender === 'ai' ? 'ai' : 'user'} ${
                    (isSpeaking && speakingMessageId === i) || (isPaused && pausedMessageId === i) ? 'speaking' : ''
                  }`}
                  onClick={() => msg.sender === 'ai' && handleMessageClick(msg, i)}
                  style={msg.sender === 'ai' ? { cursor: 'pointer' } : undefined}
                >
                  {msg.sender === 'ai' && (speakingMessageId === i || pausedMessageId === i) && (
                    <div className="speaking-indicator">
                      <IonIcon icon={isPaused && pausedMessageId === i ? pauseCircleOutline : volumeHighOutline} />
                      <span>{isPaused && pausedMessageId === i ? 'Paused' : 'Speaking'}</span>
                    </div>
                  )}
                  {msg.text}
                  <div className="message-timestamp">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <img 
                    src={userProfilePic} 
                    alt="You" 
                    className="profile-img" 
                  />
                )}
              </div>

              {/* Display place suggestions only when available and relevant */}
              {msg.places && msg.places.length > 0 && (
                <div className="place-suggestion-container">
                  <div className="place-suggestion-header">
                    <IonIcon icon={map} /> Recommended Places
                  </div>
                  {msg.places.map((place, idx) => (
                    <div 
                      key={idx} 
                      className="place-card"
                      onClick={() => handlePlaceClick(place)}
                    >
                      <img 
                        src={imageErrors.has(place.id) ? FALLBACK_IMAGE : place.image} 
                        alt={place.title} 
                        className="place-card-image"
                        onError={() => handleImageError(place.id)}
                      />
                      <div className="place-card-info">
                        <h4>{place.title}</h4>
                        <p>
                          <IonIcon icon={location} /> {place.address}
                        </p>
                        <div className="place-card-rating">
                          <IonIcon icon={star} /> {place.rating} ({place.reviews} reviews)
                          <span> • {place.distance}</span>
                        </div>
                        <span className="place-badge">{place.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Searching/Thinking Indicators */}
          {isSearching && (
            <div className="message-container ai">
              <img src="/assets/images/AI/ALI 2.png" alt="AI" className="profile-img" />
              <div className="searching-state">
                <IonIcon icon={search} className="searching-pulse" />
                <span>Searching for places...</span>
              </div>
            </div>
          )}

          {isThinking && !isSearching && (
            <div className="message-container ai">
              <img src="/assets/images/AI/ALI 2.png" alt="AI" className="profile-img" />
              <div className="thinking-indicator">
                <div className="thinking-spinner"></div>
                <span>Thinking...</span>
              </div>
            </div>
          )}

          {isTyping && !isThinking && !isSearching && (
            <div className="message-container ai">
              <img src="/assets/images/AI/ALI 2.png" alt="AI" className="profile-img" />
              <div className="bubble ai typing">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          {/* Suggestions for first message */}
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
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <button
            className="icon-btn"
            onClick={toggleListening}
            style={{ color: isListening ? '#ef4444' : '#0084ff' }}
            aria-label="Toggle voice input"
          >
            <IonIcon icon={isListening ? micOff : mic} />
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask about Pasig City..."}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={isListening}
          />

          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping || isThinking || isSearching}
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