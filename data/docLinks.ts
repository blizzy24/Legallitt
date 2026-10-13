// Where a document's "View" action goes.
//
// "View" on a document row opens a viewer showing that document. There are two
// viewers: the advocate one (design/261, app/advocate/documents/viewer.tsx) and
// the client one (design/57, app/documents/[id].tsx). Neither has a renderer for
// arbitrary files — both draw a fixed printed page — so the link carries the
// document's name (and, for the advocate viewer, its client and matter) and the
// viewer shows that name in its header over the drawn page.

/** The advocate document viewer, opened on one document. */
export function advDocHref(name: string, opts: { client?: string; matter?: string } = {}) {
  const q = new URLSearchParams({ name });
  if (opts.client) q.set('client', opts.client);
  if (opts.matter) q.set('matter', opts.matter);
  return `/advocate/documents/viewer?${q.toString()}`;
}

/**
 * The client document viewer, opened on one document. `id` is a DOCUMENTS id when
 * the file is one of the client's stored documents; otherwise the viewer uses its
 * first document's page count and size and shows `name` in the header.
 */
export function clientDocHref(name: string, id = 'file') {
  return `/documents/${encodeURIComponent(id)}?name=${encodeURIComponent(name)}`;
}
