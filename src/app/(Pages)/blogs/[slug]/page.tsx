import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export default async function Page({ params }) {
  const filepath = `src/content/${params.slug}.md`;

  if (!fs.existsSync(filepath)) {
    notFound();
    return;
  }

  const fileContent = fs.readFileSync(filepath, "utf-8");
  const { content, data } = matter(fileContent);

  const processor = unified()
    .use(remarkParse) // Parse the markdown into an abstract syntax tree (AST)
    .use(remarkGfm) // Enable GitHub-flavored markdown features (tables, inline code, etc.)
    .use(remarkRehype) // Transform Markdown AST to HTML AST
    .use(rehypeDocument, { title: data.title || "Docker Containerization" }) // Wrap content in document structure
    .use(rehypeSlug) // Add slugs for headings
    .use(rehypeAutolinkHeadings) // Autolink headings
    .use(rehypePrettyCode, {
      theme: "github-dark",
      transformers: [
        transformerCopyButton({
          visibility: "always",
          feedbackDuration: 3_000,
        }),
      ],
    })
    // .use(rehypeFormat) // Format the HTML output
    .use(rehypeStringify); // Convert the HTML AST back to a string

  // Process the markdown content and generate HTML
  const htmlContent = (await processor.process(content)).toString();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
      <p className="text-base mb-2 border-l-4 border-gray-500 pl-4 italic">
        &quot;{data.description}&quot;
      </p>
      <div className="flex gap-2">
        <p className="text-sm text-gray-500 mb-4 italic">By {data.author}</p>
        <p className="text-sm text-gray-500 mb-4">{data.date}</p>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="prose dark:prose-invert"
      ></div>
    </div>
  );
}
