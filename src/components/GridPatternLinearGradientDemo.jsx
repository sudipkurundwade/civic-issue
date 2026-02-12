import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";

export const BackgroundGrid = () => {
  return (
    // <div 
    //   className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    //   style={{ 
    //     width: '100vw', 
    //     height: '100vh',
    //     position: 'fixed',
    //     top: 0,
    //     left: 0,
    //     right: 0,
    //     bottom: 0
    //   }}
    // >
    //   <GridPattern
    //     width={40}
    //     height={40}
    //     x={-1}
    //     y={-1}
    //     className={cn(
    //       "w-full h-full",
    //     )}
    //   />
    // </div>
  <div></div>
  );
};

const GridPatternLinearGradientDemo = () => {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20">
      <GridPattern
        width={20}
        height={20}
        x={-1}
        y={-1}
        className={cn(
          "mask-[linear-gradient(to_bottom_right,white,transparent,transparent)]",
        )}
      />
    </div>
  );
};
export default GridPatternLinearGradientDemo;