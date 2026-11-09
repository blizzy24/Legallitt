import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { PaymentQuote } from '@legalitt/shared';
import type { NoticeRepository } from './repository';

export function useCheckoutQuote(repository: NoticeRepository, id: string | undefined, enabled: boolean) {
  const [quote, setQuote] = useState<PaymentQuote>();
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    if (!enabled || !id) return;
    let alive = true;
    setLoading(true); setQuote(undefined); setError('');
    void repository.paymentQuote(id).then(value => { if (alive) setQuote(value); })
      .catch(() => { if (alive) setError('Couldn’t calculate your payment. Check your connection and retry. Nothing has been charged.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [repository, id, enabled, attempt]));
  return {quote, quoteLoading: loading, quoteError: error, retryQuote: () => setAttempt(n => n + 1)};
}
