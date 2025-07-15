# Markdown Notes

![Screenshot of Markdown Notes](screenshot.png)

This is a web-based Markdown editor, formatter, and previewer with
support for [LaTeX](https://www.latex-project.org/) math formulas. It
automatically formats Markdown documents using
[Prettier](https://prettier.io/), displays previews, and converts them
into [URI fragments](https://en.wikipedia.org/wiki/URI_fragment), making
it easy to save documents quickly by bookmarking or to share them with
others. You can also save your Markdown documents to your browser's
[local
storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).

The app is highly privacy-respecting. No information about the content
of the documents or any other metadata is ever sent to external servers.
It automatically caches all core resources to your browser using the
[Service Worker
API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
enabling offline usage. We enforce a strict [Content Security
Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
to ensure that no sensitive user data is transmitted to external
servers. The content set as the URI fragment is in standard JSON format,
which can be easily parsed using a few lines of scripts or standard
third-party tools.

To run the app locally:

```sh
bun install
bun run build
bun run preview
```
