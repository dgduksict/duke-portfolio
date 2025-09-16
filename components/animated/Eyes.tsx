"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function Eyes() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const pupilX = useTransform(mouseX, [0, typeof window !== "undefined" ? window.innerWidth : 1000], [-6, 6]);
  const pupilY = useTransform(mouseY, [0, typeof window !== "undefined" ? window.innerHeight : 800], [-6, 6]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="flex gap-2 items-center ml-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="w-6 h-6 bg-primary rounded-full flex justify-center items-center shadow-sm">
          <motion.div
            className="w-3 h-3 bg-black rounded-full"
            style={{ x: pupilX, y: pupilY }}
          />
        </div>
      ))}
    </div>
  );
}
