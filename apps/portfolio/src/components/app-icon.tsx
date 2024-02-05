import { cn } from "@repo/utils";
import { apps } from "../constants";

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
    <button
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-gray-500 p-0 transition-transform duration-300 ease-in-out",
        "h-full flex-1 object-contain",
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

export { AppIcon };
