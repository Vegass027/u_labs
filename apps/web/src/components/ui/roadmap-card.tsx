"use client";

export interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  status?: "done" | "in-progress" | "upcoming";
}

export interface RoadmapCardProps {
  items: RoadmapItem[];
}

export function RoadmapCard({
  items,
}: RoadmapCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-4 h-px bg-white/20" />

        <div className="flex gap-2 sm:gap-4 justify-center">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative text-center flex-1 min-w-[80px] sm:min-w-[100px]"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute left-1/2 top-2 -translate-x-1/2 h-4 w-4 rounded-full flex items-center justify-center ${
                  item.status === "done" || item.status === "in-progress"
                    ? "bg-white"
                    : "bg-white/30"
                }`}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-black" />
              </div>

              {/* Quarter */}
              <div
                className={`-mt-2 text-[11px] px-2.5 py-0.5 rounded-full border inline-block ${
                  item.status === "done" || item.status === "in-progress"
                    ? "bg-white text-black border-white"
                    : "text-white/70 border-white/30"
                }`}
              >
                {item.quarter}
              </div>

              {/* Title + Description */}
              <h4 className="text-sm font-medium text-white">{item.title}</h4>
              <p className="text-xs text-white/70 mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
