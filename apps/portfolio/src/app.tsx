import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { appIconSize, apps } from "./constants";
import { AppSpace } from "./components/app-space";

function ParentApp() {
  const [app, setApp] = useState<string>("/test-child");

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

  return (
    <div className="flex h-full w-full bg-blue-400 p-[0px]">
      <div
        className="hide-scrollbar relative flex h-full flex-1 snap-y snap-mandatory flex-col flex-nowrap items-center overflow-auto"
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
        {/* <iframe id="viewer" className="h-full w-full" /> */}
        {/* <iframe id="viewer" src={app} className="h-full w-full" /> */}
      </div>
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
