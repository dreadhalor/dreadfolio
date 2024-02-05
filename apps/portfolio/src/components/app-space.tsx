import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { appIconSize, apps } from "../constants";
import { AppIcon } from "./app-icon";
import { cn } from "@repo/utils";
import { useRef, useState } from "react";
type AppSpaceProps = {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  parentRef?: React.RefObject<HTMLDivElement>;
  app: (typeof apps)[number];
};
const AppSpace = ({
  app,
  onClick,
  className,
  style,
  parentRef,
}: AppSpaceProps) => {
  const { description, name, background, image, alt } = app;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: parentRef,
    offset: ["end start", "start end"],
  });
  const o_1 = 100;
  const o_2 = 0;
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCoords((prev) => {
      let newCoords = prev;
      const t = latest;
      const o_high = Math.max(o_1, o_2);
      const o_low = Math.min(o_1, o_2);
      const leftHigh = o_1 > o_2;
      const topHigh = (-2 * o_high - 400) * t + 200;
      const topLow = (-2 * o_high - 400) * t + o_high - o_low + 200;
      const bottomHigh = (-2 * o_high - 400) * t + o_high + o_low + 300;
      const bottomLow = (-2 * o_high - 400) * t + 2 * o_high + 300;
      // if (name === "enlight") console.log(`deltaY from ${name}`, deltaY);
      newCoords = {
        topLeft: { x: 0, y: leftHigh ? topHigh : topLow },
        topRight: {
          x: 100,
          y: leftHigh ? topLow : topHigh,
        },
        bottomRight: {
          x: 100,
          y: leftHigh ? bottomLow : bottomHigh,
        },
        bottomLeft: {
          x: 0,
          y: leftHigh ? bottomHigh : bottomLow,
        },
      };
      return newCoords;
    });
  });

  const [coords, setCoords] = useState({
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  });
  const descriptionWidth = 300;
  const clientHeight = ref.current?.clientHeight ?? 0;
  const clientWidth = ref.current?.clientWidth ?? 0;
  const cubeSize = Math.min(clientHeight, clientWidth);

  return (
    <motion.div
      ref={ref}
      id={`${name}-space`}
      className={cn(
        "relative flex h-full w-full shrink-0 items-center justify-center overflow-visible p-0",
        className,
      )}
      style={{
        scrollSnapAlign: "center",
        clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* create a polygon that is a parallelogram that connects the top-left corner to the bottom-right corner  */}
      {/* <div
        className={cn(
          "absolute left-0 top-0 h-full w-full border-4",
          background,
        )}
        style={{
          clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
        }}
      /> */}
      {/* <motion.div
        className="absolute left-0 top-1/2 z-10 h-[5px] bg-yellow-500"
        style={{
          width: `${scrollYProgress.get() * 100}%`,
        }}
      /> */}
      <div className="absolute inset-0 flex place-items-center overflow-hidden">
        <motion.div
          className="absolute z-10 flex flex-col items-center justify-center gap-4 rounded-lg bg-black/60 p-5 text-center text-white"
          style={{
            width: descriptionWidth,
            left: `calc(50% - ${descriptionWidth / 2}px - ${
              appIconSize / 2
            }px)`,
            transform: `translateX(${(scrollYProgress.get() - 0.5) * 100}%)`,
          }}
        >
          <h1 className="text-2xl font-bold">{name}</h1>
          {description}
        </motion.div>
      </div>

      <div
        className="relative flex h-full flex-1 items-center justify-center p-4 md:p-8"
        style={{
          perspective: 1000,
        }}
      >
        {image ? (
          // <div className="z-10 flex h-full w-full items-center justify-center rounded-lg p-8">
          <img
            className="m-auto max-h-full max-w-full rounded-lg"
            src={image}
            alt={alt}
            style={{
              transform: `rotateX(${-(scrollYProgress.get() - 0.5) * 90}deg)`,
            }}
          />
        ) : (
          // </div>
          alt
        )}
        {/* <AppIcon
          app={app}
          onClick={onClick}
          style={{
            transform: `translate3d(0, 0, -100px) rotateX(${
              -(scrollYProgress.get() - 0.5) * 20
            }deg)`,
            filter: "blur(2px)",
          }}
        /> */}
      </div>
      <div
        className="h-full shrink-0"
        style={{
          width: appIconSize,
        }}
      ></div>

      <div
        className={cn(
          "absolute -top-full left-0 -z-10 h-[300%] w-full",
          apps.findIndex((a) => a.name === name) === apps.length - 1 &&
            "h-[200%]",
          background,
        )}
      ></div>
    </motion.div>
  );
};

export { AppSpace };
