import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function JoinSection() {
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{"Join With Us"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <p className="text-pretty opacity-90">
            {
              "Partner with the campus events team to host workshops, meetups, and festivals. Collaborate with student clubs and bring your ideas to life."
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="text-primary-foreground"
            style={{ backgroundImage: "linear-gradient(90deg, var(--color-primary), var(--color-chart-2))" }}
          >
            {"Propose an Event"}
          </Button>
          <Button variant="secondary">{"Become a Volunteer"}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
