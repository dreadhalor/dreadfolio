import { Button } from "dread-ui";
import { useEffect, useState } from "react";

function ParentApp() {
  const [message, setMessage] = useState("");
  const [childMessage, setChildMessage] = useState("");
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
      <iframe id="viewer" src="/test-child" className="h-full w-full" />
    </div>
  );
}

export { ParentApp as App };
