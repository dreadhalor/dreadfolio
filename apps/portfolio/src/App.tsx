import { Button } from "dread-ui";
import { useEffect, useState } from "react";
import {
  AsciiVideoIcon,
  EnlightIcon,
  MinesweeperIcon,
  PathfinderVisualizerIcon,
} from "@repo/assets";

const AppIcon = ({
  src,
  alt,
  onClick,
}: {
  src?: string;
  alt: string;
  onClick: () => void;
}) => {
  return (
    <button
      className="flex h-12 w-12 items-center justify-center overflow-hidden border border-gray-500 p-0 transition-transform duration-300 ease-in-out hover:scale-110"
      onClick={onClick}
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

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 border-8 border-red-500 p-4">
      Hey, I'm a parent app.
      <div className="flex gap-2">
        <input
          placeholder="Send message to child"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <Button label="Talk to child" onClick={() => clicked(message)} />
      </div>
      Child says: {childMessage}
      <div className="flex flex-nowrap gap-2">
        <AppIcon alt="Test App" onClick={() => setApp("/test-child")} />
        <AppIcon
          src={EnlightIcon}
          alt="Enlight Icon"
          onClick={() => setApp("/enlight")}
        />
        <AppIcon
          src={MinesweeperIcon}
          alt="Minesweeper Icon"
          onClick={() => setApp("/minesweeper")}
        />
        <AppIcon
          src={PathfinderVisualizerIcon}
          alt="Pathfinder Visualizer Icon"
          onClick={() => setApp("/pathfinder-visualizer")}
        />
        <AppIcon
          src={AsciiVideoIcon}
          alt="Matrix-Cam Icon"
          onClick={() => setApp("/ascii-video")}
        />
        <AppIcon alt="dread ui" onClick={() => setApp("/dread-ui")} />
      </div>
      <iframe id="viewer" src={app} className="h-full w-full" />
    </div>
  );
}

export { ParentApp as App };
