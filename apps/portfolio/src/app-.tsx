// import { Button } from "dread-ui";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/utils";
import { motion } from "framer-motion";
import { apps } from "./apps";

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
  const { name, background } = app;
  const ref = useRef(null);
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

  // console.log(scrollYProgress.get());

  return (
    <motion.div
      ref={ref}
      id={`${name}-space`}
      className={cn(
        "relative flex h-full w-full shrink-0 items-center justify-center overflow-visible p-4",
        // scrollYProgress.get() > 0 && scrollYProgress.get() < 1 && "visible",
        // background,
        className,
      )}
      style={{
        scrollSnapAlign: "center",
        clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
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
      <motion.div
        className="absolute left-0 top-1/2 z-10 h-[5px] bg-yellow-500"
        style={{
          width: `${scrollYProgress.get() * 100}%`,
        }}
      />
      <AppIcon
        app={app}
        onClick={onClick}
        style={
          {
            // clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
            // ...style,
          }
        }
      />
      <motion.div
        className={cn(
          "absolute -top-full left-0 -z-10 h-[300%] w-full",
          background,
        )}
      ></motion.div>
    </motion.div>
  );
};
const AppIcon = ({
  app: { icon, alt },
  onClick,
  className,
  style,
}: AppSpaceProps) => {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-gray-500 p-0 transition-transform duration-300 ease-in-out",
        "aspect-square h-full",
        // "hover:scale-110",
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {icon ? <img src={icon} alt={alt} className="h-full w-full" /> : alt}
    </button>
  );
};

function ParentApp() {
  const [message, setMessage] = useState("");
  const [childMessage, setChildMessage] = useState("");
  const [app, setApp] = useState<string>("/test-child");
  useEffect(() => {
    const handler = (ev: MessageEvent<{ type: string; message: string }>) => {
      if (typeof ev.data !== "object") return;
      if (!ev.data.type) return;
      if (ev.data.type !== "button-click") return;
      if (!ev.data.message) return;

      setChildMessage(ev.data.message);
    };

    window.addEventListener("message", handler);

    // Don't forget to remove addEventListener
    return () => window.removeEventListener("message", handler);
  }, []);

  const clicked = (msg: string) => {
    const iframe = document.getElementById("viewer") as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      {
        type: "button-click",
        message: msg,
      },
      "*",
    );
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: parentRef,
  });
  // function useParallax(value: MotionValue<number>, distance: number) {
  //   return useTransform(value, [0, 1], [-distance, distance]);
  // }
  // const y = useParallax(scrollYProgress, 10);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setWidth(latest * 100);
  });
  const [width, setWidth] = useState(0);
  const appIconSize = 48;

  return (
    <div className="flex h-full w-full overflow-visible bg-blue-400 p-[100px]">
      <div
        className="hide-scrollbar relative flex h-full w-full snap-y snap-mandatory flex-col flex-nowrap items-center overflow-auto border border-red-500"
        ref={parentRef}
      >
        <motion.div
          className="fixed left-0 top-0 z-10 h-1 w-full bg-gray-500"
          style={{ width: `${scrollYProgress.get() * 100}%` }}
        />
        {/* <div
        className="fixed right-0 top-1/2 z-10 h-1 w-full bg-gray-500"
        style={{ width: `100%` }}
      /> */}

        {apps.map(({ name, icon, alt }, index) => (
          <button
            key={name}
            className="fixed z-10 overflow-hidden rounded-md border border-gray-500"
            style={{
              width: appIconSize,
              height: appIconSize,
              right: 0,
              top: `calc(50% - ${
                scrollYProgress.get() * (apps.length - 1) * appIconSize
              }px)`,
              transform: `translateY(${-50 + 100 * index}%)`,
            }}
            onClick={() => {
              const appSpace = document.getElementById(`${name}-space`);
              appSpace?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <img src={icon} alt={alt} />
          </button>
        ))}
        {apps.map((app, index) => (
          <AppSpace
            key={app.name}
            app={app}
            onClick={() => setApp(app.url)}
            parentRef={parentRef}
            style={
              {
                // zIndex: 10 - index,
              }
            }
          />
        ))}
        {/* <iframe id="viewer" className="h-full w-full" /> */}
        {/* <iframe id="viewer" src={app} className="h-full w-full" /> */}
      </div>
    </div>
  );
}

export { ParentApp as App };
