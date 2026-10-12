// screens/DocViewerScreen.js
// Route "/doc?path=&name=&cat=..". Renders a single markdown document and
// resolves its cross-links through the app Router (see lib/docs.js).

import { Markdown, colors, useQueryParams } from "flet-box";
import { bindDocLinks, setCurrentDocPath } from "../lib/docs.js";
import { page } from "../components/ui.js";

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
    padding: 12,
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
    fetch(docPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${docPath}`);
        return res.text();
      })
      .then(apply)
      .catch((err) => {
        apply(
          `# Not found\n\n\`${docPath}\` is not part of this documentation set.\n\n${err.message}`,
        );
      });
  }

  return page([markdown]);
};

export default DocViewerScreen;