import { forwardRef, type ReactNode, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePluginsSync } from "@/lib/markdown";
import { HighlightedCode } from "./HighlightedCode";

interface Props {
  source: string;
  widthClass?: string;
  fontClass?: string;
}

function isExternal(href: string | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
  return "";
}

export const MarkdownView = forwardRef<HTMLDivElement, Props>(function MarkdownView(
  { source, widthClass = "md-width-normal", fontClass = "md-font-m" },
  ref,
) {
  if (source.trim().length === 0) {
    return (
      <div
        ref={ref}
        className={`md-body mx-auto w-full ${widthClass} ${fontClass} px-6 py-10 text-ink-muted dark:text-nightInk-muted`}
      >
        <p>내용이 비어 있어요.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={`md-body mx-auto w-full ${widthClass} ${fontClass} px-6 py-10`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePluginsSync}
        components={{
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className ?? "");
            if (match) {
              return <HighlightedCode lang={match[1]} code={extractText(children).replace(/\n$/, "")} />;
            }
            return <code className={className} {...rest}>{children}</code>;
          },
          a: ({ href, children, ...rest }) => {
            if (isExternal(href)) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                  {children}
                </a>
              );
            }
            return <a href={href} {...rest}>{children}</a>;
          },
          table: ({ children, ...rest }) => (
            <div className="table-wrap"><table {...rest}>{children}</table></div>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
});
