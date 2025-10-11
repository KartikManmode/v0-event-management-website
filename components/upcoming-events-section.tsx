import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { EventItem } from "@/lib/events"

export function EventGrid({ items }: { items: EventItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((e) => (
        <EventCard key={e.slug} item={e} />
      ))}
    </div>
  )
}

export function EventCard({ item }: { item: EventItem }) {
  return (
    <Card className="bg-card text-card-foreground flex flex-col overflow-hidden border-2">
      <CardHeader className="p-0">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          width={640}
          height={360}
          className="w-full h-48 object-cover grayscale"
        />
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <CardTitle className="text-lg text-balance">{item.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
        <p className="text-sm mt-2 text-pretty">{item.tagline}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/events/${item.slug}`} className="w-full">
          <Button
            variant="default"
            className="w-full text-primary-foreground hover:bg-primary/90 bg-[rgba(100,34,255,1)]"
          >
            {"Explore"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
