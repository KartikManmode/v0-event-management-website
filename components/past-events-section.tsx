import { EventGrid } from "./upcoming-events-section"
import type { EventItem } from "@/lib/events"

export function PastEventGrid({ items }: { items: EventItem[] }) {
  return <EventGrid items={items} />
}
