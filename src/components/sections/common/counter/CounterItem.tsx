import { useState } from "react";
import CountUp from "./CountUp";

type CounterItemProps = {
  number: number;
  label: string;
  more?: boolean;
  unit?: string;
  duration?: number;
};

const CounterItem = ({ number, label, more, unit, duration }: CounterItemProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  return (
    <div className="w-[250px] text-center">
      <h3 className="sm:text-heading-4 text-primary lg:text-heading-2 mb-2.5 text-3xl font-bold -tracking-[1.6px] xl:text-[55px] xl:leading-[1.05]">
        <CountUp
          targetNumber={number}
          duration={duration}
          onComplete={() => setAnimationComplete(true)}
        />
        {more && animationComplete && <span className="-ml-3">+</span>}
        {unit && animationComplete && <span className="ml-2 text-2xl xl:text-4xl">{unit}</span>}
      </h3>
      <p className="text-xl font-medium -tracking-[0.2px] sm:text-lg">{label}</p>
    </div>
  );
};

export default CounterItem;
