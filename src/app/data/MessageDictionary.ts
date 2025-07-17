/**
 * Dictionary of messages for the typing game
 * Messages are loaded from JSON file and categorized by level
 */

import messagesData from "./messages.json";

export interface MessageEntry {
  text: string;
  author: string;
  level: 1 | 2;
}

export class MessageDictionary {
  private static messages: MessageEntry[] = messagesData as MessageEntry[];

  /**
   * Get a random message from all available messages
   */
  public static getRandomMessage(): MessageEntry {
    const randomIndex = Math.floor(
      Math.random() * MessageDictionary.messages.length,
    );
    return MessageDictionary.messages[randomIndex];
  }

  /**
   * Get a random message by level
   */
  public static getRandomMessageByLevel(level: 1 | 2): MessageEntry {
    const filteredMessages = MessageDictionary.messages.filter(
      (message) => message.level === level,
    );

    if (filteredMessages.length === 0) {
      // Fallback to any message if no messages for this level
      return MessageDictionary.getRandomMessage();
    }

    const randomIndex = Math.floor(Math.random() * filteredMessages.length);
    return filteredMessages[randomIndex];
  }

  /**
   * Get multiple random messages
   */
  public static getRandomMessages(count: number): MessageEntry[] {
    const messages: MessageEntry[] = [];
    for (let i = 0; i < count; i++) {
      messages.push(MessageDictionary.getRandomMessage());
    }
    return messages;
  }

  /**
   * Get all messages for specific level
   */
  public static getMessagesByLevel(level: 1 | 2): MessageEntry[] {
    return MessageDictionary.messages.filter(
      (message) => message.level === level,
    );
  }

  /**
   * Get all messages
   */
  public static getAllMessages(): MessageEntry[] {
    return [...MessageDictionary.messages];
  }

  /**
   * Get message text only (for easier integration with existing Word system)
   */
  public static getRandomMessageText(): string {
    return MessageDictionary.getRandomMessage().text;
  }

  /**
   * Get message text by level
   */
  public static getRandomMessageTextByLevel(level: 1 | 2): string {
    return MessageDictionary.getRandomMessageByLevel(level).text;
  }

  /**
   * Check if a message exists in dictionary
   */
  public static isValidMessage(text: string): boolean {
    return MessageDictionary.messages.some(
      (message) => message.text.toLowerCase() === text.toLowerCase(),
    );
  }

  /**
   * Get message by text
   */
  public static getMessageByText(text: string): MessageEntry | null {
    return (
      MessageDictionary.messages.find(
        (message) => message.text.toLowerCase() === text.toLowerCase(),
      ) || null
    );
  }

  /**
   * Get total message count
   */
  public static getMessageCount(): number {
    return MessageDictionary.messages.length;
  }

  /**
   * Get message count by level
   */
  public static getMessageCountByLevel(level: 1 | 2): number {
    return MessageDictionary.messages.filter(
      (message) => message.level === level,
    ).length;
  }
}
