-- The rendered notice. A draft links the PDF generated when it was sent for
-- client review; the case links the final PDF generated on the client's approval.
ALTER TABLE drafts ADD COLUMN document_id UUID REFERENCES documents(id);
ALTER TABLE cases ADD COLUMN notice_document_id UUID REFERENCES documents(id);
