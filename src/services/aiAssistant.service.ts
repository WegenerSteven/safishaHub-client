import apiService from "./api";
import type { ChatMessage } from '@/components/AIChatbot'

export class AiAssistantService {
  //chat with ai assistant
  async chat(message: string): Promise<ChatMessage> {
    try {
      const response = await apiService.post<{ message: string },{text: string; actions?: Array<{label: string; to: string}>}>(
        '/ai-assistant/chat',
        { message }
      );
      return {
        id: Date.now(),
        sender: 'bot',
        text: response.text || 'Sorry, I could not process your request.',
        actions: response.actions,
      };
    } catch (error: any) {
      return {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, the AI assistant is currently unavailable. Please try again later.',
      };
    }
  }
}

export const aiAssistantService = new AiAssistantService();