import {
  IconCheck,
  IconCircle,
} from "@tabler/icons-react";

import type { TrackingEvent } from "@/config/orders";

interface OrderTimelineProps {
  events: TrackingEvent[];
  compact?: boolean;
}

export function OrderTimeline({
  events,
  compact = false,
}: OrderTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const isLast =
          index === events.length - 1;

        return (
          <div
            key={`${event.status}-${index}`}
            className={`
              relative
              flex
              gap-3
              ${isLast ? "" : "pb-5"}
            `}
          >
            {!isLast && (
              <span
                className={`
                  absolute
                  left-[7px]
                  top-5
                  h-[calc(100%-8px)]
                  w-px
                  ${
                    event.completed
                      ? "bg-primary/60"
                      : "bg-border"
                  }
                `}
              />
            )}

            <div
              className={`
                relative
                z-10
                flex
                h-4
                w-4
                shrink-0
                items-center
                justify-center
                rounded-full
                ${
                  event.current
                    ? "bg-primary text-white shadow-[0_0_16px_var(--glow-primary)]"
                    : event.completed
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-muted"
                }
              `}
            >
              {event.completed ? (
                <IconCheck
                  size={10}
                  stroke={2.5}
                />
              ) : (
                <IconCircle
                  size={7}
                  fill="currentColor"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className={`
                      text-xs
                      font-medium
                      ${
                        event.current
                          ? "text-primary"
                          : event.completed
                            ? "text-foreground"
                            : "text-muted"
                      }
                    `}
                  >
                    {event.title}
                  </p>

                  {!compact && (
                    <p className="mt-1 max-w-md text-[10px] leading-4 text-muted">
                      {event.description}
                    </p>
                  )}

                  {event.location && (
                    <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-muted">
                      {event.location}
                    </p>
                  )}
                </div>

                {event.timestamp && (
                  <span className="shrink-0 text-[9px] text-muted">
                    {event.timestamp}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}