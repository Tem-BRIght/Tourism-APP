import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonBackButton,
  IonToast,
  IonButton
} from '@ionic/react';
import {
  mic, micOff, send, settingsOutline, search,
  location, star, map, close, volumeHighOutline,
  pauseCircleOutline, playCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDestinations } from '../../services/destinationService';
import { Destination } from '../../types';
import './AIGuide.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlaceCategory =
  | 'historical' | 'food' | 'park' | 'religious'
  | 'shopping' | 'entertainment' | 'museum' | 'church'
  | 'restaurant' | 'mall';

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
  category: PlaceCategory;
  tags: string[];
};

// ─── Static data (fallback) ───────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'What are the top 5 must-see places in Pasig?',
  'Recommend historical sites near me',
  'Where can I eat the best food in Pasig?',
  'Find family-friendly spots in Pasig',
  'What churches can I visit?',
  'Suggest parks for relaxation',
  'Where to go shopping?',
];

const PLACE_KEYWORDS = [
  'where', 'place', 'spot', 'location', 'go', 'visit', 'see',
  'recommend', 'suggest', 'find', 'looking for', 'show',
  'museum', 'park', 'church', 'restaurant', 'cafe', 'mall',
  'eat', 'food', 'shop', 'historical', 'heritage', 'tour',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  historical: ['historical', 'history', 'heritage', 'museum', 'culture', 'old'],
  museum:     ['museum', 'exhibit', 'gallery', 'artifacts'],
  church:     ['church', 'cathedral', 'religious', 'spiritual', 'mass', 'prayer'],
  food:       ['food', 'restaurant', 'eat', 'cafe', 'dining', 'kainan', 'coffee', 'meal'],
  park:       ['park', 'nature', 'outdoor', 'garden', 'relax', 'picnic', 'walk'],
  shopping:   ['shop', 'mall', 'buy', 'shopping', 'store', 'market'],
  family:     ['family', 'kids', 'children', 'child-friendly'],
};

// ─── Language detection helper ─────────────────────────────────────────────

function detectLanguage(text: string): 'en' | 'tl' | 'mixed' {
  const tagalogWords = [
    'ang', 'ng', 'sa', 'ay', 'ito', 'ko', 'mo', 'siya', 'tayo', 'kayo', 'sila',
    'po', 'opo', 'oo', 'hindi', 'wala', 'meron', 'gusto', 'pumunta', 'kainan',
    'saan', 'paano', 'magkano', 'bakit', 'kailan', 'sino', 'anong', 'may',
    'nasa', 'dito', 'doon', 'roon', 'akin', 'iyo', 'kanya', 'atin', 'inyo', 'kanila',
    'naman', 'talaga', 'lang', 'pa', 'na', 'ba', 'kasi', 'din', 'rin', 'kung',
    'para', 'aking', 'iyong', 'kaniyang', 'aming', 'inyong', 'kanilang',
    'ikaw', 'ka', 'ako', 'kami', 'tayo', 'kita', 'niya', 'nila', 'natin',
    'yung', 'ung', 'mga', 'eto', 'ganito', 'ganyan', 'gano', 'parang',
    'medyo', 'sana', 'kaya', 'pala', 'yata', 'daw', 'raw', 'umalis', 'kumain',
    'uminom', 'matulog', 'maglakad', 'maglaro', 'magpahinga', 'maganda',
    'masarap', 'mura', 'mahal', 'mainit', 'malamig', 'maulan', 'maaraw',
    'dito', 'diyan', 'doon', 'kanan', 'kaliwa', 'deretso', 'liko', 'tabi',
    'gilid', 'loob', 'labas', 'itaas', 'ibaba', 'harap', 'likod'
  ];
  const words = text.toLowerCase().split(/\s+/);
  let tagalogCount = 0;
  for (const w of words) {
    if (tagalogWords.includes(w)) tagalogCount++;
  }
  const ratio = tagalogCount / words.length;
  if (ratio > 0.25) return 'tl';
  if (ratio > 0.1) return 'mixed';
  return 'en';
}

// ─── Base system prompts ───────────────────────────────────────────

const BASE_SYSTEM_PROMPT_EN =
  'You are ALI, a friendly and knowledgeable AI tourism guide for Pasig City, Philippines. ' +
  'You help tourists and locals discover the best places, food, culture, and activities in Pasig City. ' +
  'Keep responses concise (1-2 sentences max), warm, and helpful. ' +
  'Always mention specific place names when relevant.';

const BASE_SYSTEM_PROMPT_TL =
  'Ikaw si ALI, isang magiliw at matalinong AI tour guide para sa Pasig City, Philippines. ' +
  'Tumutulong ka sa mga turista at lokal na alamin ang pinakamagagandang lugar, pagkain, kultura, at aktibidad sa Pasig. ' +
  'Panatilihing maikli ang sagot (1-2 pangungusap lang), mainit, at nakakatulong. ' +
  'Palaging banggitin ang mga partikular na pangalan ng lugar kung may kaugnayan. ' +
  'Magsalita ka sa natural na Taglish (Tagalog at English) – parang kausap mo lang ang isang kaibigan. ' +
  'Huwong masyadong pormal; gumamit ng mga salitang ginagamit ng mga Pilipino sa pang-araw-araw na usapan.';

// ─── AI message formatter ─────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*{1,2}[^*]+\*{1,2})/g);
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*(.+)\*$/.test(part))     return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function formatAIMessage(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="ai-msg-list">
          {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const t = line.trim();
    if (/^[-*•]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
      listItems.push(t.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      return;
    }
    flushList();
    if (!t) return;
    if (/^[A-Z].{0,48}:$/.test(t)) {
      elements.push(<p key={idx} className="ai-msg-heading">{t}</p>);
      return;
    }
    elements.push(<p key={idx} className="ai-msg-para">{renderInline(t)}</p>);
  });
  flushList();
  return <>{elements}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AIGuide: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! I'm your Pasig AI Guide 👋\nHow can I help you explore today?", sender: 'ai', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'any' | 'female' | 'male'>('female');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [pausedMessageId, setPausedMessageId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [tappedMessageId, setTappedMessageId] = useState<number | null>(null);

  // Destinations state (from Realtime Database)
  const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const isMutedRef = useRef(isMuted);
  const voiceSpeedRef = useRef(voiceSpeed);
  const voiceGenderRef = useRef(voiceGender);
  const isSendingRef = useRef(false);

  // Sync refs with state
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { voiceSpeedRef.current = voiceSpeed; }, [voiceSpeed]);
  useEffect(() => { voiceGenderRef.current = voiceGender; }, [voiceGender]);

  // Voice changed handler
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Fetch destinations from Realtime Database on mount
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setPlacesLoading(true);
        const data: Destination[] = await fetchDestinations();

        // Map Destination to PlaceSuggestion (adjust field names as needed)
        const mapped: PlaceSuggestion[] = data.map(dest => ({
          id: dest.id,
          title: dest.name || dest.title || 'Unknown Place',
          image: dest.imageUrl || dest.image || '/assets/images/placeholder.jpg',
          rating: dest.rating ?? 4.5,          // fallback if missing
          reviews: dest.reviews ?? 0,
          distance: dest.distance ?? '2 km',    // fallback; you can compute later
          address: dest.address || '',
          type: dest.category || 'attraction',  // use category if exists
          category: (dest.category as PlaceCategory) || 'historical',
          tags: [],                              // tags not in Destination; keep empty
        }));

        setPlaces(mapped);
        setPlacesError(null);
      } catch (err) {
        console.error('Error loading destinations:', err);
        setPlacesError('Failed to load places. Using offline data.');
        // Optionally set fallback static data here
      } finally {
        setPlacesLoading(false);
      }
    };
    loadDestinations();
  }, []);

  // User profile pic
  const userProfilePic = localStorage.getItem('profilePic') || '/assets/images/Temporary.png';

  const handleImageError = useCallback((placeId: string) => {
    setImageErrors(prev => new Set(prev).add(placeId));
  }, []);

  // ── Speech synthesis ────────────────────────────────────────────────────────

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingMessageId(null);
      setPausedMessageId(null);
    }
  }, []);

  const speakMessage = useCallback((text: string, messageIndex: number) => {
    if (isMutedRef.current || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const gender = voiceGenderRef.current;

      let preferredVoice: SpeechSynthesisVoice | undefined;
      if (gender === 'female') {
        preferredVoice = voices.find(v => /female|zira|susan|karen|hazel|samantha|victoria/i.test(v.name));
      } else if (gender === 'male') {
        preferredVoice = voices.find(v => /male|david|mark|paul|alex|james|robert/i.test(v.name));
      } else {
        preferredVoice = voices.find(v => v.lang.startsWith('en') && v.default);
      }
      if (!preferredVoice) {
        preferredVoice = voices.find(v => v.lang.startsWith('en'));
      }
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.rate = voiceSpeedRef.current;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); setSpeakingMessageId(messageIndex); setPausedMessageId(null); };
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); setSpeakingMessageId(null); setPausedMessageId(null); };
      utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); setSpeakingMessageId(null); setPausedMessageId(null); };
      utterance.onpause = () => { setIsSpeaking(false); setIsPaused(true); };
      utterance.onresume = () => { setIsSpeaking(true); setIsPaused(false); };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingMessageId(null);
      setPausedMessageId(null);
    }
  }, []);

  const togglePlayPause = useCallback((messageIndex: number, messageText?: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMessageId === messageIndex || pausedMessageId === messageIndex) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeakingMessageId(messageIndex);
        setPausedMessageId(null);
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsSpeaking(false);
        setIsPaused(true);
        setSpeakingMessageId(null);
        setPausedMessageId(messageIndex);
      }
    } else if (messageText) {
      stopSpeaking();
      speakMessage(messageText, messageIndex);
    }
  }, [speakingMessageId, pausedMessageId, stopSpeaking, speakMessage]);

  // ── Speech recognition ──────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'fil-PH';

      rec.onresult = (event: any) => {
        if (!mountedRef.current) return;

        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript;
        setInput(transcript);

        if (last.isFinal) {
          sendMessage(transcript);
          setIsListening(false);
          setShowVoiceIndicator(false);
        }
      };

      rec.onstart = () => {
        if (!mountedRef.current) return;
        setShowVoiceIndicator(true);
        setIsListening(true);
      };

      rec.onerror = (event: any) => {
        if (!mountedRef.current) return;

        let friendlyMsg = 'Voice input error. Please try again.';

        if (event.error === 'not-allowed') {
          friendlyMsg = 'Microphone access denied. Please allow access.';
        } else if (event.error === 'no-speech') {
          friendlyMsg = 'No speech detected. Try again.';
        }

        setIsListening(false);
        setShowVoiceIndicator(false);
        setErrorMessage(friendlyMsg);
        setShowErrorToast(true);
      };

      rec.onend = () => {
        if (mountedRef.current) {
          setIsListening(false);
          setShowVoiceIndicator(false);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      mountedRef.current = false;
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, [stopSpeaking]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isThinking, isSearching]);

  // ── Place suggestion logic ──────────────────────────────────────────────────

  const shouldShowPlaceSuggestions = useCallback((query: string): boolean => {
    const q = query.toLowerCase();
    return PLACE_KEYWORDS.some(kw => q.includes(kw));
  }, []);

  // Returns relevant places based on user query only (no AI response yet)
  const getRelevantPlaces = useCallback((userQuery: string, maxPlaces = 5): PlaceSuggestion[] => {
    if (!shouldShowPlaceSuggestions(userQuery) || places.length === 0) return [];

    const q = userQuery.toLowerCase();

    // Top / best / must-see → return top-rated
    if (['top', 'best', 'must-see', 'famous'].some(kw => q.includes(kw))) {
      return [...places].sort((a, b) => b.rating - a.rating).slice(0, maxPlaces);
    }

    // Category matching
    const matched = new Set<string>();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => q.includes(kw))) {
        matched.add(cat);
      }
    }

    if (matched.size > 0) {
      const seen = new Set<string>();
      const results: PlaceSuggestion[] = [];
      for (const place of places) {
        if (!seen.has(place.id) && (matched.has(place.category) || place.tags.some(t => matched.has(t)))) {
          seen.add(place.id);
          results.push(place);
        }
      }
      if (results.length > 0) return results.slice(0, maxPlaces);
    }

    // Generic recommendation
    if (['recommend', 'suggest', 'where'].some(kw => q.includes(kw))) {
      return places.slice(0, maxPlaces);
    }

    return [];
  }, [places, shouldShowPlaceSuggestions]);

  // Used after AI response to also match against AI text (keeps backward compatibility)
  const extractPlaceSuggestions = useCallback((
    userQuery: string,
    aiResponse: string
  ): PlaceSuggestion[] => {
    const baseMatches = getRelevantPlaces(userQuery, 3);
    if (baseMatches.length > 0) return baseMatches;

    // If no matches from user query, try matching AI response (fallback)
    const r = aiResponse.toLowerCase();
    const matched = new Set<string>();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => r.includes(kw))) {
        matched.add(cat);
      }
    }
    if (matched.size > 0) {
      const seen = new Set<string>();
      const results: PlaceSuggestion[] = [];
      for (const place of places) {
        if (!seen.has(place.id) && (matched.has(place.category) || place.tags.some(t => matched.has(t)))) {
          seen.add(place.id);
          results.push(place);
        }
      }
      return results.slice(0, 3);
    }
    return [];
  }, [places, getRelevantPlaces]);

  // ── AI response ─────────────────────────────────────────────────────────────

  const generateAIResponse = async (
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): Promise<{ text: string; places: PlaceSuggestion[] }> => {
    setIsSearching(true);
    setIsThinking(true);

    try {
      if (!GROQ_API_KEY) {
        return { text: 'API key not configured. Please set the VITE_GROQ_API_KEY environment variable.', places: [] };
      }

      // Simulate "thinking" delay
      await new Promise(res => setTimeout(res, 800));

      // Get relevant places from Firebase based on user query
      const relevantPlaces = getRelevantPlaces(userMessage, 5);
      
      // Build place context string
      let placeContext = '';
      if (relevantPlaces.length > 0) {
        placeContext = '\n\nHere are some places in Pasig that might match the user\'s interest:\n' +
          relevantPlaces.map(p => 
            `- ${p.title}: ${p.type}, ${p.rating}⭐, ${p.distance} away. ${p.address}`
          ).join('\n') +
          '\n\nWhen recommending places, you can refer to these specific locations.';
      }

      // Detect language of the user message
      const lang = detectLanguage(userMessage);
      const basePrompt = (lang === 'tl' || lang === 'mixed') ? BASE_SYSTEM_PROMPT_TL : BASE_SYSTEM_PROMPT_EN;
      const systemPrompt = basePrompt + placeContext;

      const historyMessages = conversationHistory.slice(-6).map(msg => ({
        role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      }));

      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'system', content: systemPrompt }, ...historyMessages, { role: 'user', content: userMessage }],
          temperature: 0.7,
          max_tokens: 180,
          top_p: 0.9,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`GROQ API ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const aiText: string | undefined = data.choices?.[0]?.message?.content;

      if (aiText) {
        // Use the same relevant places for cards (or refine with extractPlaceSuggestions if needed)
        const finalPlaces = relevantPlaces.slice(0, 3); // Show up to 3 cards
        return { text: aiText, places: finalPlaces };
      }

      return { text: 'I received an unexpected response. Please try again.', places: [] };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: "Hmm, I'm having trouble connecting right now. Please check your internet and try again.",
        places: []
      };
    } finally {
      setIsSearching(false);
      setIsThinking(false);
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSendingRef.current || isTyping || isThinking || isSearching) return;

    isSendingRef.current = true;
    stopSpeaking();
    setInput('');

    const userMessage: ChatMessage = {
      text: trimmed,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    await generateAndRespond(trimmed, updatedMessages);
  };

  // ── Respond input ──────────────────────────────────────────────────────────────

  const generateAndRespond = async (
    userText: string,
    updatedHistory: ChatMessage[]
  ) => {
    setIsTyping(true);

    try {
      const { text: aiText, places: suggestedPlaces } =
        await generateAIResponse(userText, updatedHistory);

      if (!mountedRef.current) return;

      setMessages(prev => {
        const aiMessage: ChatMessage = {
          text: aiText,
          sender: 'ai',
          timestamp: new Date(),
          places: suggestedPlaces
        };
        const updated = [...prev, aiMessage];

        if (!isMutedRef.current) {
          setTimeout(() => {
            speakMessage(aiText, updated.length - 1);
          }, 0);
        }

        return updated;
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (mountedRef.current) {
        setIsTyping(false);
        setIsSearching(false);
        setIsThinking(false);
      }
      isSendingRef.current = false;
    }
  };

  // ── Voice input ──────────────────────────────────────────────────────────────

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setErrorMessage('Voice input is not supported in this browser. You can still type.');
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
        setErrorMessage('Could not start voice recognition. Please try again.');
        setShowErrorToast(true);
      }
    }
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setShowVoiceIndicator(false);
    setIsListening(false);
  };

  // ── Other handlers ───────────────────────────────────────────────────────────

  const handlePlaceClick = (place: PlaceSuggestion) => {
    stopSpeaking();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    history.push(`/destination/${place.id}`, place);
  };

  const handleMessageClick = (msg: ChatMessage, index: number) => {
    if (msg.sender !== 'ai') return;
    togglePlayPause(index, msg.text);
    setTappedMessageId(prev => (prev === index ? null : index));
  };

  const isBusy = isTyping || isThinking || isSearching;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ai-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/Home" />
          </IonButtons>
          <IonTitle>
            <div className="title">AI Pasig Guide</div>
            <div className="subtitle">Assistant for Pasig City</div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setShowSettings(true)} aria-label="Open settings">
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* ── Voice indicator overlay ── */}
      {showVoiceIndicator && (
        <div className="voice-indicator" role="status" aria-live="polite">
          <div className="voice-wave" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <span className="voice-text">Listening…</span>
          <button className="voice-stop-btn" onClick={stopVoiceInput} aria-label="Stop voice input">
            <IonIcon icon={close} />
          </button>
        </div>
      )}

      {/* ── Settings modal ── */}
      <IonModal isOpen={showSettings} onDidDismiss={() => setShowSettings(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setShowSettings(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel>Mute Voice</IonLabel>
              <IonToggle
                checked={isMuted}
                onIonChange={e => {
                  setIsMuted(e.detail.checked);
                  if (e.detail.checked) stopSpeaking();
                }}
              />
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
              <IonSelect value={voiceSpeed} onIonChange={e => setVoiceSpeed(parseFloat(e.detail.value))}>
                <IonSelectOption value={0.8}>Slow</IonSelectOption>
                <IonSelectOption value={1.0}>Normal</IonSelectOption>
                <IonSelectOption value={1.2}>Fast</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>

      {/* ── Main content ── */}
      <IonContent className="chat-content">
        <div className="chat-area">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`message-container ${msg.sender}${i === 0 && msg.sender === 'ai' ? ' welcome' : ''}`}>
                {msg.sender === 'ai' && (
                  <img src="/assets/images/AI/ALI 2.png" alt="AI Guide" className="profile-img" />
                )}

                <div className="bubble-col">
                  {/* Speaking / paused pill — floated above bubble */}
                  {msg.sender === 'ai' && (speakingMessageId === i || pausedMessageId === i) && (
                    <div className="speaking-indicator" aria-live="polite">
                      <IonIcon
                        icon={isPaused && pausedMessageId === i ? pauseCircleOutline : volumeHighOutline}
                      />
                      <span>{isPaused && pausedMessageId === i ? 'Paused' : 'Speaking'}</span>
                    </div>
                  )}

                  <div
                    className={`bubble ${msg.sender} ${
                      (isSpeaking && speakingMessageId === i) || (isPaused && pausedMessageId === i)
                        ? 'speaking'
                        : ''
                    }`}
                    onClick={() => msg.sender === 'ai' && handleMessageClick(msg, i)}
                    role="button"
                    tabIndex={msg.sender === 'ai' ? 0 : undefined}
                    onKeyDown={e => msg.sender === 'ai' && e.key === 'Enter' && handleMessageClick(msg, i)}
                    aria-label={
                      msg.sender === 'ai'
                        ? `AI message. Click to ${speakingMessageId === i ? 'pause' : 'play'}.`
                        : undefined
                    }
                  >
                    {msg.sender === 'ai' ? formatAIMessage(msg.text) : msg.text}

                    <div className="message-timestamp" aria-label={`Sent at ${msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <img src={userProfilePic} alt="You" className="profile-img" />
                )}
              </div>

              {/* Place suggestion cards */}
              {msg.places && msg.places.length > 0 && (
                <div className="place-suggestion-container">
                  <div className="place-suggestion-header">
                    <IonIcon icon={map} aria-hidden="true" /> Recommended Places
                  </div>
                  {msg.places.map(place => (
                    <div
                      key={place.id}
                      className="place-card"
                      onClick={() => handlePlaceClick(place)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handlePlaceClick(place)}
                      aria-label={`View details for ${place.title}`}
                    >
                      <img
                        src={imageErrors.has(place.id) ? '/assets/images/placeholder.jpg' : place.image}
                        alt={place.title}
                        className="place-card-image"
                        onError={() => handleImageError(place.id)}
                      />
                      <div className="place-card-info">
                        <h4>{place.title}</h4>
                        <p>
                          <IonIcon icon={location} aria-hidden="true" /> {place.address}
                        </p>
                        <div className="place-card-rating">
                          <IonIcon icon={star} aria-hidden="true" /> {place.rating}
                          <span>({place.reviews} reviews) · {place.distance}</span>
                        </div>
                        <span className="place-badge">{place.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* State indicators */}
          {isSearching && (
            <div className="message-container ai" role="status" aria-live="polite">
              <img src="/assets/images/AI/ALI 2.png" alt="" className="profile-img" aria-hidden="true" />
              <div className="searching-state">
                <IonIcon icon={search} className="searching-pulse" aria-hidden="true" />
                <span>Searching for places…</span>
              </div>
            </div>
          )}

          {isThinking && !isSearching && (
            <div className="message-container ai" role="status" aria-live="polite">
              <img src="/assets/images/AI/ALI 2.png" alt="" className="profile-img" aria-hidden="true" />
              <div className="thinking-indicator">
                <div className="thinking-spinner" aria-hidden="true" />
                <span>Thinking…</span>
              </div>
            </div>
          )}

          {isTyping && !isThinking && !isSearching && (
            <div className="message-container ai" role="status" aria-live="polite">
              <img src="/assets/images/AI/ALI 2.png" alt="" className="profile-img" aria-hidden="true" />
              <div className="bubble ai typing" aria-label="AI is typing">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}

          {/* Suggested questions — only on fresh conversation */}
          {messages.length === 1 && (
            <div className="suggestions" role="complementary" aria-label="Suggested questions">
              <p className="suggest-title">Suggested Questions</p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="input-area">
          {isListening ? (
            <button
              className="icon-btn listening"
              onClick={toggleListening}
              aria-label="Stop listening"
              aria-pressed="true"
            >
              <IonIcon icon={micOff} />
            </button>
          ) : (
            <button
              className="icon-btn"
              onClick={toggleListening}
              aria-label="Start voice input"
              aria-pressed="false"
            >
              <IonIcon icon={mic} />
            </button>
          )}

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? 'Listening…' : 'Ask about Pasig City…'}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={isListening}
            aria-label="Message input"
          />

          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isBusy}
            aria-label="Send message"
          >
            <IonIcon icon={send} />
          </button>
        </div>

        <IonToast
          isOpen={showErrorToast}
          onDidDismiss={() => { setShowErrorToast(false); setErrorMessage(null); }}
          message={errorMessage ?? 'An error occurred'}
          duration={4000}
          color="danger"
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AIGuide;