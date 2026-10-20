// screens/DocViewerScreen.js
// Route "/doc?path=&name=&cat=..". Renders a single markdown document and
// resolves its cross-links through the app Router (see lib/docs.js).

import { Column, Markdown, colors, useQueryParams } from "flet-box";
import { bindDocLinks, fetchDoc, setCurrentDocPath } from "../lib/docs.js";

export const DocViewerScreen = () => {
  bindDocLinks();

  const { path } = useQueryParams();
  const docPath = path || "";
  setCurrentDocPath(docPath);

  // Build the markdown node synchronously (so it is in the DOM immediately)
  // then swap in the fetched source once it arrives. Keep the styling plain so
  // documents read like they do on GitHub: default typography, themed code
  // surfaces and no decorative wrapper.
  const markdown = Markdown({
    text: "# Loading…",
    // The breathing room after the last line lives inside the scroll container:
    // as wrapper padding it would paint a dead strip of scaffold background
    // between the document and the bottom bar that never scrolls away.
    padding: "0 0 24px 0",
    fontSize: 15,
    lineHeight: 1.7,
    color: colors.text,
    codeBgColor: colors.gray100,
    codeColor: colors.text,
  });

  const apply = (text) => {
    if (markdown.isConnected) markdown.updateContent(text);
  };

  if (!docPath) {
    apply("# Not found\n\nNo document was requested.");
  } else {
    fetchDoc(docPath)
      .then(apply)
      .catch((err) => {
        apply(
          `# Not found\n\n\`${docPath}\` is not part of this documentation set.\n\n${err.message}`,
        );
      });
  }

  // The document's own first heading supplies the top space, and the wrapper
  // only pads the sides: the reader gets the full height between the AppBar and
  // the bottom bar, with no fixed strip of background under the last line.
  return Column({
    width: "100%",
    padding: "4px 16px 0 16px",
    child: markdown,
  });
};

export default DocViewerScreen;