// JSON-LD inside <script>: escape "<" so no string in the data can close the tag.
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
