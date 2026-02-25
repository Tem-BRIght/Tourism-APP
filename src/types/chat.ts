export type ChatMessage = {
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
};