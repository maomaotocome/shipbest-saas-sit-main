import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import CarouselClient from "./client";

// props
type CarouselProps = {
  type: string;
  className?: string;
};

const Carousel = async ({ type, className }: CarouselProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "carousel", type });

  return <CarouselClient slides={data.slides} autoPlay={data.autoPlay} interval={data.interval} className={className} />;
};

export default Carousel;
