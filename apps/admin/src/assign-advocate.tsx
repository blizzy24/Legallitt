import { useEffect, useRef, useState } from 'react';
import { ApiError, type AdminAdvocate, type ServiceCode } from '@legalitt/shared';
import { api, useSession } from './session';

export function AssignAdvocate({caseId, reference, service = 'legal_notice', close, assigned,choose:onChoose,excludeId}: {
  caseId: string; reference: string; service?: ServiceCode; close(): void; assigned(): void;choose?(id:string):Promise<unknown>;excludeId?:string;
}) {
  const {refuse} = useSession();
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<AdminAdvocate[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null), [retry, setRetry] = useState(0);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.adminAdvocates(service).then(result => {if (alive) setItems(result.items.filter(a=>a.id!==excludeId));})
      .catch(e => {if (alive) setError(e instanceof Error ? e.message : 'Unable to load advocates');})
      .finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [retry, service]);
  const choose = async (advocate: AdminAdvocate) => {
    if (busy) return;
    setBusy(advocate.id); setError('');
    try {await (onChoose?onChoose(advocate.id):api.assign(caseId, advocate.id)); assigned();}
    catch (e) {
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse('Admin access required. Sign in again.');
      else setError(e instanceof Error ? e.message : 'Unable to assign advocate');
    } finally {setBusy(null);}
  };
  return <dialog className="assign-dialog" ref={dialog} aria-labelledby="assign-title" onCancel={e => {e.preventDefault(); if (!busy) close();}}>
    <div className="dialog-heading"><div><h2 id="assign-title">Assign advocate</h2><p>{reference}</p></div><button aria-label="Close advocate picker" disabled={Boolean(busy)} onClick={close}>×</button></div>
    {error && <div role="alert" className="error">{error}</div>}
    {loading ? <p role="status">Loading advocates…</p> : <>
      {items.length === 0 && <p>No approved advocates available</p>}
      <div className="advocate-options">{items.map(advocate => <button key={advocate.id} className="advocate-option" disabled={Boolean(busy)} onClick={() => void choose(advocate)} aria-label={`Assign to ${advocate.name}`}>
        <span className="advocate-details"><strong>{advocate.name}</strong>
          {advocate.practice_areas.length > 0 && <span>{advocate.practice_areas.join(' · ')}</span>}
          {advocate.city && <span>{advocate.city}</span>}
        </span>
        <span className="advocate-load"><strong>{advocate.open_cases}</strong><span>open cases</span></span>
        <span className="choose-label">{busy === advocate.id ? 'Assigning…' : 'Assign'}</span>
      </button>)}</div>
      {error && <button disabled={Boolean(busy)} onClick={() => setRetry(n => n + 1)}>Refresh advocates</button>}
    </>}
  </dialog>;
}
