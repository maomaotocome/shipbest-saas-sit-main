import { fakerEN, fakerZH_CN } from "@faker-js/faker";
import { PrismaClient } from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

function generateMarkdownContent(locale: string): string {
  const faker = locale === "en" ? fakerEN : fakerZH_CN;

  // Generate 2-4 paragraphs with secondary headings
  const sections = Array.from({ length: faker.number.int({ min: 2, max: 4 }) })
    .map(() => {
      const title = faker.lorem.sentence();
      const paragraphs = Array.from({ length: faker.number.int({ min: 2, max: 4 }) })
        .map(() => faker.lorem.paragraph())
        .join("\n\n");

      return `## ${title}\n\n${paragraphs}`;
    })
    .join("\n\n");

  // Generate code examples
  const codeExample =
    locale === "en"
      ? `\`\`\`typescript
function example() {
  const data = fetchData();
  return data.map(item => ({
    id: item.id,
    value: processItem(item)
  }));
}
\`\`\``
      : `\`\`\`typescript
function 示例() {
  const 数据 = 获取数据();
  return 数据.map(项目 => ({
    标识: 项目.id,
    值: 处理项目(项目)
  }));
}
\`\`\``;

  // Generate list
  const list = Array.from({ length: faker.number.int({ min: 3, max: 5 }) })
    .map(() => `- ${faker.lorem.sentence()}`)
    .join("\n");

  // Generate quote
  const quote = `> ${faker.lorem.paragraph()}`;

  // Combine all elements
  return `${sections}\n\n${quote}\n\n${list}\n\n${codeExample}`;
}

async function main() {
  console.log("🌱 Starting blog seeding...");

  // Clean data in correct order
  await prisma.blogTagsOnPosts.deleteMany(); // Delete association tables first
  await prisma.blogPostTranslation.deleteMany(); // Delete translations
  await prisma.blogPost.deleteMany();
  await prisma.blogCategoryTranslation.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.blogTagTranslation.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogAuthor.deleteMany();

  // Create authors
  const authors = await Promise.all([
    prisma.blogAuthor.create({
      data: {
        name: "John Smith",
        slug: "john-smith",
        bio: "Senior Technical Writer & AI Researcher | 资深技术作家与人工智能研究员",
        image: "https://picsum.photos/seed/john/200.webp",
      },
    }),
    prisma.blogAuthor.create({
      data: {
        name: "张明",
        slug: "zhang-ming",
        bio: "AI Development Engineer & Cloud Expert | 人工智能开发工程师与云计算专家",
        image: "https://picsum.photos/seed/zhang/200.webp",
      },
    }),
    prisma.blogAuthor.create({
      data: {
        name: "Sarah Johnson",
        slug: "sarah-johnson",
        bio: "Machine Learning Specialist & Data Scientist | 机器学习专家与数据科学家",
        image: "https://picsum.photos/seed/sarah/200.webp",
      },
    }),
    prisma.blogAuthor.create({
      data: {
        name: "李华",
        slug: "li-hua",
        bio: "Full-stack Developer & System Architect | 全栈开发者与系统架构师",
        image: "https://picsum.photos/seed/li/200.webp",
      },
    }),
  ]);

  // Create 20 categories
  const categories = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      const slug = `category-${i + 1}`;
      return prisma.blogCategory.create({
        data: {
          slug,
          translations: {
            create: [
              {
                locale: "en",
                name: `Technology ${i + 1}`,
              },
              {
                locale: "zh",
                name: `技術 ${i + 1}`,
              },
            ],
          },
        },
      });
    })
  );

  // Create 50 tags
  const tags = await Promise.all(
    Array.from({ length: 50 }).map(async (_, i) => {
      const slug = `tag-${i + 1}`;
      return prisma.blogTag.create({
        data: {
          slug,
          translations: {
            create: [
              {
                locale: "en",
                name: `Tag ${i + 1}`,
              },
              {
                locale: "zh",
                name: `標籤 ${i + 1}`,
              },
            ],
          },
        },
      });
    })
  );

  // Create 200 posts
  await Promise.all(
    Array.from({ length: 200 }).map(async (_, i) => {
      const slug = `post-${i + 1}`;
      const randomTags = fakerEN.helpers.arrayElements(
        tags,
        fakerEN.number.int({ min: 1, max: 5 })
      );
      const randomCategory = fakerEN.helpers.arrayElement(categories);
      const randomAuthor = fakerEN.helpers.arrayElement(authors); // Randomly select author

      // Generate English and Chinese content
      const enContent = generateMarkdownContent("en");
      const zhContent = generateMarkdownContent("zh");
      console.log(zhContent);
      return prisma.blogPost.create({
        data: {
          slug,
          authorId: randomAuthor.id,
          categoryId: randomCategory.id,
          publishedAt: fakerEN.date.past(),
          coverImageUrl: `https://picsum.photos/seed/${slug}/800/400.webp`,
          translations: {
            create: [
              {
                locale: "en",
                title: fakerEN.lorem.sentence(),
                content: enContent,
                metadata: fakerEN.lorem.sentence(),
              },
              {
                locale: "zh",
                title: fakerZH_CN.lorem.sentence(),
                content: zhContent,
                metadata: fakerZH_CN.lorem.sentence(),
              },
            ],
          },
          tags: {
            create: randomTags.map((tag) => ({
              tagId: tag.id,
            })),
          },
        },
      });
    })
  );

  console.log("✅ Blog seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding blog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
