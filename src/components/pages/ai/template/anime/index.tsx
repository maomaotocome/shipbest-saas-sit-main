import Hero from "@/components/sections/ai/image/template/anime/hero";
import Pricing from "@/components/sections/common/pricing";
import { TemplateType } from "@/lib/constants";

export default async function AnimeTemplate() {
  return (
    <>
      <Hero templateType={TemplateType.StylizedAnimeImage} />
      <Pricing />
    </>
  );
}
