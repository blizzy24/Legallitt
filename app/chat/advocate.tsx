import PreviewStep from '../../components/PreviewStep';

// BLOCKED — design/33 (chat with advocate) uses grey iMessage-style bubbles, a stock
// photograph and a brown header that don't match the app's design language and
// conflict with the support chat. Placeholder route until the client decides.
//
// What renders is the neutral preview step: the service, one line, and Back.
export default function AdvocateChatScreen() {
  return <PreviewStep header="Chat with Advocate" service="Chat with Advocate" />;
}
