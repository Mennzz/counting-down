import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function XiaoBaoMarkdown({
  content,
  streaming = false,
}: {
  content: string;
  streaming?: boolean;
}) {
  return (
    <div className="xiaobao-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-950">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-rose-300 pl-3 italic text-slate-600 last:mb-0">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 text-[0.95rem] font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 font-semibold">{children}</h3>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-rose-700 underline decoration-rose-300 underline-offset-2 hover:text-rose-900"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-rose-50 px-1 py-0.5 font-mono text-[0.85em] text-rose-950">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-50 last:mb-0">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-3 border-rose-100" />,
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="xiaobao-stream-caret" aria-hidden />}
    </div>
  );
}
