import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router, type Href } from 'expo-router';
import { BookText, Crop, File } from 'lucide-react-native';
import { DATA_SOURCE } from '../../lib/data-source';
import { useKyc } from '../../context/kyc';
import { previewNotice } from '../../components/PreviewNotice';
import { clientDocHref } from '../../data/docLinks';
import { useIntakeModel } from './useIntakeModel';
type Doc = {id?: string; title: string; subtitle: string; icon: import('lucide-react-native').LucideIcon};

const categories = [
  {kind:'property_papers',title:'Property Papers',subtitle:'Sales Deed, Khata, etc',icon:File},
  {kind:'agreement',title:'Agreement',subtitle:'Any agreement document',icon:BookText},
  {kind:'screenshots',title:'Screenshots',subtitle:'WhatsApp, Email, etc',icon:Crop},
];
export function useUploadModel(stage: 'step4' | 'step4-review') {
  const {model,controller:c} = useIntakeModel(stage);
  const {kyc,begin} = useKyc();
  const api = DATA_SOURCE === 'api';
  useEffect(() => {
    if (!api && stage === 'step4-review' && !model.form.documents.length) model.update({documents:categories.map(d=>d.title)});
  }, [api,stage]);
  const localReturn: string = '/legal-notice/' + stage;
  let returnTo: Href = localReturn as Href;
  if (api) returnTo = c.href(localReturn);
  const upload = async (title: string) => c.upload(categories.find(d=>d.title===title)?.kind ?? 'supporting_document');
  const documents: Doc[] = api ? (c.record?.documents ?? []).map(d => ({
    ...(categories.find(row=>row.kind===d.kind) ?? {title:'',subtitle:'',icon:File}), id:d.id,
  })) : categories;
  return {
    error: c.error, onBack: model.back,
    documents, count:api ? documents.length : model.form.documents.length || categories.length, returnTo,
    // An already-submitted case is repairing its files, not starting intake again.
    // D-40: no identity-verification checkpoint in API mode; KYC is not built.
    onContinue: () => api || kyc.completed ? model.continue() : begin(returnTo),
    onUpload: (title:string) => { if (api) void c.run(()=>upload(title)); else previewNotice(title==='Add More Documents'?title:`Upload ${title}`); },
    onAdd: () => { if(api) c.go('/legal-notice/step4'); else previewNotice('Add More Documents'); },
    onView: (doc:Doc) => { if(api) void c.run(async()=>{if(doc.id) await Linking.openURL((await c.repository.documentUrl(doc.id)).url);}); else router.push(clientDocHref(doc.title) as Href); },
    onDelete: (doc:Doc) => { if(api) void c.run(async()=>{if(doc.id) await c.repository.deleteDocument(doc.id);await c.load();}); else previewNotice(`Delete ${doc.title}`); },
    onReplace: (doc:Doc) => { if(api) void c.run(async()=>{if(await upload(doc.title)){if(doc.id) await c.repository.deleteDocument(doc.id);await c.load();}}); else previewNotice(`Replace ${doc.title}`); },
  };
}
