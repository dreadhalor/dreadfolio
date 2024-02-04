// import { Button } from "dread-ui";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/utils";
import {
  AsciiVideoIcon,
  AsciiVideoScreenshot,
  EnlightIcon,
  EnlightScreenshot,
  MinesweeperIcon,
  MinesweeperScreenshot,
  PathfinderVisualizerIcon,
  PathfinderVisualizerScreenshot,
} from "@repo/assets";
// import AppSpaceMask from "./assets/app-space-mask.svg";
import { motion } from "framer-motion";

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
  const [width, setWidth] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: parentRef,
    offset: ["end start", "start end"],
  });
  const offset = 100;
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // console.log(`latest from ${name}`, scrollYProgress.get());
    // setWidth(latest);
    setCoords((prev) => {
      let newCoords = prev;
      const deltaY = latest * 100;
      // if (name === "enlight") console.log(`deltaY from ${name}`, deltaY);
      newCoords = {
        topLeft: { x: 0, y: 50 - offset - deltaY - (deltaY - 50) * 5 },
        topRight: { x: 100, y: 50 - deltaY - (deltaY - 50) * 4 },
        bottomRight: { x: 100, y: 150 + offset - deltaY - (deltaY - 50) * 5 },
        bottomLeft: { x: 0, y: 150 - deltaY - (deltaY - 50) * 5 },
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
        "relative flex h-full w-full shrink-0 items-center justify-center overflow-visible border-2 p-4",
        // background,
      )}
      style={{
        scrollSnapAlign: "center",
        clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
        // maskImage: `url(${AppSpaceMask})`,
        // WebkitMaskImage: `url(${AppSpaceMask})`,
        // maskSize: "100% 100%",
        // WebkitMaskSize: "100% 100%",
        // maskRepeat: "no-repeat",
        // WebkitMaskRepeat: "no-repeat",
      }}
    >
      {/* <img src={AppSpaceMask} className="absolute" /> */}
      {/* create a polygon that is a parallelogram that connects the top-left corner to the bottom-right corner  */}
      {/* <div
        className="absolute left-0 top-0 h-full w-full bg-yellow-500"
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
        className={className}
        style={{
          // clipPath: `polygon(${coords.topLeft.x}% ${coords.topLeft.y}%, ${coords.topRight.x}% ${coords.topRight.y}%, ${coords.bottomRight.x}% ${coords.bottomRight.y}%, ${coords.bottomLeft.x}% ${coords.bottomLeft.y}%)`,
          ...style,
        }}
      />
      <motion.div
        className={cn(
          "absolute -top-full left-0 -z-10 h-[500%] w-full",
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

const apps = [
  {
    name: "test-child",
    url: "/test-child",
    icon: "",
    alt: "Test App",
    image: "",
    background: "bg-red-500",
  },
  {
    name: "enlight",
    url: "/enlight",
    icon: EnlightIcon,
    alt: "Enlight Icon",
    image: EnlightScreenshot,
    background: "bg-blue-500",
  },
  {
    name: "minesweeper",
    url: "/minesweeper",
    icon: MinesweeperIcon,
    alt: "Minesweeper Icon",
    image: MinesweeperScreenshot,
    background: "bg-green-500",
  },
  {
    name: "pathfinder-visualizer",
    url: "/pathfinder-visualizer",
    icon: PathfinderVisualizerIcon,
    alt: "Pathfinder Visualizer Icon",
    image: PathfinderVisualizerScreenshot,
    background: "bg-yellow-500",
  },
  {
    name: "ascii-video",
    url: "/ascii-video",
    icon: AsciiVideoIcon,
    alt: "Matrix-Cam Icon",
    image: AsciiVideoScreenshot,
    background: "bg-purple-500",
  },
  {
    name: "dread-ui",
    url: "/dread-ui",
    icon: "",
    alt: "dread ui",
    image: "",
    background: "bg-pink-500",
  },
] as const;

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
      {apps.map((app) => (
        <AppSpace
          key={app.name}
          app={app}
          onClick={() => setApp(app.url)}
          parentRef={parentRef}
        />
      ))}
      {/* <iframe id="viewer" className="h-full w-full" /> */}
      {/* <iframe id="viewer" src={app} className="h-full w-full" /> */}
    </div>
  );
}

export { ParentApp as App };
