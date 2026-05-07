import { forwardRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePluginsSync } from "@/lib/markdown";
import { CodeBlock } from "./CodeBlock";

interface Props {
  source: string;
  widthClass?: string;
  fontClass?: string;
}

function isExternal(href: string | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
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
          pre: ({ children, node, ...rest }) => <CodeBlock {...rest}>{children as ReactNode}</CodeBlock>,
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
