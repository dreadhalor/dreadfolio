import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { appIconSize, apps } from "./constants";
import { AppSpace } from "./components/app-space";
import { useApp } from "@providers/app-provider";

function ParentApp() {
  const { app, setApp } = useApp();
  // useEffect(() => {
  //   setApp(apps[0].name);
  // }, [setApp]);

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
  console.log("width", width);
  console.log("apps", apps);

  return (
    <div className="flex h-full w-full bg-blue-400 p-[0px]">
      {app && (
        <iframe
          id="viewer"
          src={app}
          className="fixed z-10 h-full w-full"
          style={{
            paddingRight: appIconSize,
          }}
        />
      )}
      <div
        className="hide-scrollbar relative flex h-full flex-1 snap-y snap-mandatory flex-col flex-nowrap items-center overflow-auto overscroll-none"
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

        {apps.map((app) => (
          <AppSpace
            key={app.name}
            app={app}
            onClick={() => setApp(app.url)}
            parentRef={parentRef}
          />
        ))}
      </div>
      <button
        className="absolute z-10 rounded-md border-2 border-white"
        style={{
          width: appIconSize,
          height: appIconSize,
          right: 0,
          top: 0,
        }}
        onClick={() => setApp("")}
      >
        X
      </button>
      <div
        className="absolute z-10 rounded-md border-2 border-white"
        style={{
          width: appIconSize,
          height: appIconSize,
          right: 0,
          top: `calc(50% - ${appIconSize / 2}px)`,
        }}
      ></div>
      {apps.map(({ name, icon, alt }, index) => (
        <button
          key={name}
          className="absolute overflow-hidden rounded-md border border-gray-500"
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
    </div>
  );
}

export { ParentApp as App };
