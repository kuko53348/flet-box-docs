// screens/DocsScreen.js
// Route "/docs": the documentation index (search + category grid) and, when
// the ?id= query is present, a single category's doc list. All search
// filtering mutates the DOM in place so the input keeps focus while typing.

import {
  Column,
  Container,
  Icon,
  Input,
  Row,
  Text,
  colors,
  goTo,
  useQueryParams,
} from "flet-box";
import { CATEGORIES, ALL_DOCS, getCategory } from "../database/catalog.js";
import { openDoc } from "../lib/docs.js";
import {
  card,
  iconChip,
  intro,
  page,
  rowCard,
  section,
} from "../components/ui.js";

export const DocsScreen = () => {
  const { id } = useQueryParams();
  const category = id ? getCategory(id) : null;
  return category ? renderCategory(category) : renderIndex();
};

// ---------- Index: search + category grid ----------
const renderIndex = () => {
  // Live content area: swapped on every keystroke, never re-rendered.
  const content = Container({
    width: "100%",
    gap: 10,
    child: categoryGrid(),
  });

  const input = Input({
    placeholder: "Search all docs (widgets, tools, services…)",
    iconLeft: "search",
    iconColor: colors.textSecondary,
    fullWidth: true,
    onInput: (value) => {
      const query = value.trim().toLowerCase();
      content.replaceChildren(query ? searchGrid(query) : categoryGrid());
    },
  });

  return page([
    intro("Search across all categories or pick one to start exploring."),
    section({ children: [input, content] }),
  ]);
};

// Full category grid (empty query).
const categoryGrid = () =>
  Row({
    wrap: "wrap",
    gap: 12,
    alignItems: "stretch",
    children: CATEGORIES.map((cat) =>
      card(
        Column({
          gap: 12,
          children: [
            Row({
              gap: 12,
              alignItems: "center",
              children: [
                iconChip(cat.icon, colors.primary, 44),
                Column({
                  flex: 1,
                  gap: 2,
                  children: [
                    Text({ text: cat.title, weight: "bold", size: 15.5, color: colors.text }),
                    Text({
                      text: `${cat.items.length} ${cat.items.length === 1 ? "doc" : "docs"}`,
                      size: 11,
                      color: colors.primary,
                      weight: "bold",
                    }),
                  ],
                }),
                Icon({ name: "chevron_right", color: colors.textSecondary, size: 22 }),
              ],
            }),
            Text({ text: cat.description, size: 12, color: colors.textSecondary, lineHeight: 1.5 }),
          ],
        }),
        { onClick: () => goToCategory(cat.id), padding: 16 },
      ),
    ),
  });

// Flat search results (non-empty query).
const searchGrid = (query) => {
  const matches = ALL_DOCS.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      (item.hint || "").toLowerCase().includes(query),
  ).slice(0, 60);

  if (matches.length === 0) {
    return emptyState("No results", `Nothing matches “${query}”. Try another term.`);
  }

  return Column({
    gap: 6,
    children: [
      Text({
        text: `${matches.length} result${matches.length === 1 ? "" : "s"} for “${query}”`,
        size: 12,
        color: colors.textSecondary,
      }),
      ...matches.map((doc) =>
        rowCard({
          icon: doc.categoryIcon,
          title: doc.name,
          subtitle: `${doc.categoryTitle}${doc.hint ? " · " + doc.hint : ""}`,
          onPress: () => openDoc(doc),
        }),
      ),
    ],
  });
};

const emptyState = (title, subtitle) =>
  Container({
    width: "100%",
    padding: "32px 16px",
    gap: 6,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: colors.surface,
    border: `1px dashed ${colors.border}`,
    child: Column({
      gap: 6,
      alignItems: "center",
      children: [
        Icon({ name: "search_off", size: 28, color: colors.textDisabled }),
        Text({ text: title, weight: "bold", size: 15, color: colors.text }),
        Text({ text: subtitle, size: 12, color: colors.textSecondary, align: "center" }),
      ],
    }),
  });

// ---------- Category: doc list for one category ----------
const renderCategory = (category) => {
  const content = Container({
    width: "100%",
    gap: 10,
    child: categoryList(category, category.items),
  });

  const input = Input({
    placeholder: `Search in ${category.title}…`,
    iconLeft: "search",
    iconColor: colors.textSecondary,
    fullWidth: true,
    onInput: (value) => {
      const query = value.trim().toLowerCase();
      const items = query
        ? category.items.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              (item.hint || "").toLowerCase().includes(query),
          )
        : category.items;
      content.replaceChildren(
        items.length
          ? categoryList(category, items)
          : emptyState("No results", `Nothing matches “${query}” in ${category.title}.`),
      );
    },
  });

  return page([
    intro(category.description),
    section({ children: [input, content] }),
  ]);
};

const categoryList = (category, items) =>
  Column({
    gap: 8,
    children: items.map((item) =>
      rowCard({
        icon: category.icon,
        title: item.name,
        subtitle: item.hint,
        onPress: () => openDoc({ ...item, categoryId: category.id }),
      }),
    ),
  });

const goToCategory = (id) =>
  goTo(id ? `/docs?id=${encodeURIComponent(id)}` : "/docs");

export default DocsScreen;