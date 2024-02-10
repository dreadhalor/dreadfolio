import { Button } from "dread-ui";
import { useEffect, useState } from "react";

function ChildApp() {
  const [message, setMessage] = useState("");
  const [parentMessage, setParentMessage] = useState("");

  useEffect(() => {
    const handler = (ev: MessageEvent<{ type: string; message: string }>) => {
      if (typeof ev.data !== "object") return;
      if (!ev.data.type) return;
      if (ev.data.type !== "button-click") return;
      if (!ev.data.message) return;

      setParentMessage(ev.data.message);
    };

    window.addEventListener("message", handler);

    // Don't forget to remove addEventListener
    return () => window.removeEventListener("message", handler);
  }, []);

  const clicked = (msg: string) => {
    window.parent.postMessage(
      {
        type: "button-click",
        message: msg,
      },
      "*",
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 border-4 border-white">
      Hi, I am a child app.
      <div className="flex gap-2">
        <input
          placeholder="Send message to parent"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <Button label="Talk to parent" onClick={() => clicked(message)} />
      </div>
      Parent says: {parentMessage}
    </div>
  );
}

export { ChildApp as App };
