import { Button } from "dread-ui";
import {
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/utils";
import {
  AsciiVideoIcon,
  EnlightIcon,
  MinesweeperIcon,
  PathfinderVisualizerIcon,
} from "@repo/assets";

type AppSpaceProps = {
  src?: string;
  alt: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
};
const AppSpace = ({ src, alt, onClick, className, style }: AppSpaceProps) => {
  return (
    <div
      className="flex h-full w-full shrink-0 items-center justify-center border-2 p-4"
      style={{
        scrollSnapAlign: "center",
        perspective: "100px",
      }}
    >
      <AppIcon
        src={src}
        alt={alt}
        onClick={onClick}
        className={className}
        style={style}
      />
    </div>
  );
};
const AppIcon = ({ src, alt, onClick, className }: AppSpaceProps) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center overflow-hidden border border-gray-500 p-0 transition-transform duration-300 ease-in-out",
        "aspect-square h-full",
        // "hover:scale-110",
        className,
      )}
      onClick={onClick}
      // style={{ ...style, width, height }}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full" /> : alt}
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
  function useParallax(value: MotionValue<number>, distance: number) {
    return useTransform(value, [0, 1], [-distance, distance]);
  }
  const y = useParallax(scrollYProgress, 300);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setWidth(latest * 100);
  });
  const [width, setWidth] = useState(0);

  return (
    <div
      className="flex h-full w-full snap-y snap-mandatory flex-col flex-nowrap items-center overflow-auto border border-red-500"
      ref={parentRef}
    >
      <div
        className="fixed left-0 top-0 z-10 h-1 w-full bg-gray-500"
        style={{ width: `${width}%` }}
      />
      <AppSpace alt="Test App" onClick={() => setApp("/test-child")} />
      <AppSpace
        src={EnlightIcon}
        alt="Enlight Icon"
        onClick={() => setApp("/enlight")}
      />
      <AppSpace
        src={MinesweeperIcon}
        alt="Minesweeper Icon"
        onClick={() => setApp("/minesweeper")}
      />
      <AppSpace
        src={PathfinderVisualizerIcon}
        alt="Pathfinder Visualizer Icon"
        onClick={() => setApp("/pathfinder-visualizer")}
      />
      <AppSpace
        src={AsciiVideoIcon}
        alt="Matrix-Cam Icon"
        onClick={() => setApp("/ascii-video")}
      />
      <AppSpace alt="dread ui" onClick={() => setApp("/dread-ui")} />
      {/* <iframe id="viewer" className="h-full w-full" /> */}
      {/* <iframe id="viewer" src={app} className="h-full w-full" /> */}
    </div>
  );
}

export { ParentApp as App };
