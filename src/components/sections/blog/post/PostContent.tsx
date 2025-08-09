import { useMDXComponents } from "@/components/common/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import PrismHighlighter from "./PrismHighlighter";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const components = useMDXComponents({});
  return (
    <PrismHighlighter>
      <div className="prose prose-lg max-w-none">
        <MDXRemote source={content} components={components} />
      </div>
    </PrismHighlighter>
  );
}
