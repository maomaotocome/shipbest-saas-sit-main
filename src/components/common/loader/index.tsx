"use client";
import { useEffect, useState } from "react";
import LoadingAnimate from "../animate/loading-animate";
const Loader = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-999999 flex h-screen w-screen items-center justify-center bg-white">
          <LoadingAnimate />
        </div>
      )}
    </>
  );
};

export default Loader;
