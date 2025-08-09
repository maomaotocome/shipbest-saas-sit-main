"use client";
import { useMDXComponents } from "@/components/common/mdx";
import { SectionBackground } from "@/components/common/section-background";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
export default function PrivatePolicy() {
  const content = `## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

## Use License

Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modify or copy the materials
- Use the materials for any commercial purpose
- Attempt to decompile or reverse engineer any software contained on our website
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server

## Disclaimer

The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## Limitations

In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.

## Revisions and Errata

The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice.

## Links

We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.

## Site Terms of Use Modifications

We may revise these terms of use for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of use.

## Governing Law

These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
`;
  return (
    <section className="flex h-screen w-full">
      <SectionBackground />
      <div className="container mx-auto flex h-full flex-col items-center gap-8 px-4 pt-20 md:flex-row">
        <div className="w-full md:w-1/3">
          <h1 className="text-center text-xl font-bold md:text-left md:text-4xl lg:text-7xl">
            Terms and Conditions
          </h1>
          <Image
            src="/images/terms-and-conditions/illustration.svg"
            alt="Terms and Conditions"
            width={400}
            height={400}
            className="mx-auto hidden w-full max-w-[300px] md:block md:max-w-none"
          />
        </div>
        <ScrollArea className="h-[60vh] w-full rounded-md bg-black/5 p-4 backdrop-blur-sm md:h-[80vh] md:w-2/3 md:p-8 dark:bg-white/5">
          <div className="space-y-4">
            <MDXRemote source={content} components={useMDXComponents({})} />
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
