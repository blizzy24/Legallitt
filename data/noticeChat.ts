// The two Legal Notice chat threads, exactly as designs 33 and 183 draw them —
// typos included ("relevent", "Yes ia can"). Nothing is added to either thread;
// the input bar sends nothing.

export type ChatMessage = { from: 'them' | 'me'; text: string; time?: string; read?: boolean };

/** design/33 — the client's chat with Adv. Arjun Sharma (Legal Notice tracking → Chat with Advocate). */
export const NOTICE_CHAT_CLIENT = {
  name: 'Adv. Arjun Sharma',
  placeholder: 'Type a message...',
  messages: [
    { from: 'them', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...' },
    { from: 'me', text: 'Yes I can Easily send message and upload documents easily' },
    { from: 'them', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...' },
    { from: 'me', text: 'Yes ia can easily send message' },
  ] as ChatMessage[],
};

/**
 * design/183 — the advocate's chat with the client (advocate Legal Notice →
 * Message Client). ⚠ The client is "Ananya Deshmukh"; the notice's client
 * everywhere else is Rahul Sharma. Built as drawn. The "00:59 min" countdown is
 * a static string, as drawn.
 */
export const NOTICE_CHAT_ADVOCATE = {
  name: 'Ananya Deshmukh',
  valid: 'Chat Valid Upto 1 Hours From Now',
  validTime: '00:59 min',
  placeholder: 'Type a message...',
  messages: [
    { from: 'them', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...', time: '3 : 08 pm' },
    { from: 'me', text: 'Yes I can Easily send message and upload documents easily', read: true },
    { from: 'them', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...', time: '3 : 08 pm' },
    { from: 'me', text: 'Send Me More Documents??', read: true },
  ] as ChatMessage[],
};
