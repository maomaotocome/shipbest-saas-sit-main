import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: (props) => <h1 className="mt-8 mb-6 text-4xl font-bold" {...props} />,
    h2: (props) => <h2 className="mt-6 mb-4 text-3xl font-bold" {...props} />,
    h3: (props) => <h3 className="mt-5 mb-3 text-2xl font-bold" {...props} />,

    p: (props) => <p className="mb-4 leading-relaxed" {...props} />,

    a: (props) => (
      <Link
        {...props}
        className="text-blue-600 underline hover:text-blue-800"
        href={props.href || "#"}
      />
    ),

    ul: (props) => <ul className="mb-4 ml-4 list-inside list-disc" {...props} />,
    ol: (props) => <ol className="mb-4 ml-4 list-inside list-decimal" {...props} />,

    pre: (props) => <pre className="mb-4 overflow-x-auto rounded-lg p-4" {...props} />,
    code: (props) => <code className="rounded px-1 py-0.5" {...props} />,
  };
}

export function useMDXOptions() {
  const rehypePrismOptions = {
    showLineNumbers: true,
    ignoreMissing: true,
  };

  return {
    parseFrontmatter: true,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [[rehypeSlug], [rehypePrismPlus, rehypePrismOptions]],
      format: "mdx" as const,
    },
  };
}
