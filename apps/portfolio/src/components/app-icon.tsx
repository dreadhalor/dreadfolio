import { cn } from "@repo/utils";
import { apps } from "../constants";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type AppIconProps = {
  app: (typeof apps)[number];
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const AppIcon = ({
  app: { icon, alt },
  onClick,
  className,
  style,
}: AppIconProps) => {
  return (
    <motion.button
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-gray-500 p-0 transition-transform duration-300 ease-in-out",
        "h-full flex-1 object-contain",
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {icon ? <img src={icon} alt={alt} className="h-full w-full" /> : alt}
    </motion.button>
  );
};

export { AppIcon };
