export type EventItem = {
  slug: string
  title: string
  date: string
  tagline: string
  image: string
  kind: "upcoming" | "past"
  tags: string[]
  website?: string
  details: {
    description: string
    eligibility: string
    schedule: string
    location: string
    fee?: string
    requiresRegistration?: boolean
    gallery?: string[]
  }
}

export const events: EventItem[] = [
  {
    slug: "hack-the-night",
    title: "Hack the Night",
    date: "Nov 22, 2025",
    tagline: "24-hour hackathon for all disciplines",
    image: "/students-hacking-at-night.jpg",
    kind: "upcoming",
    tags: ["Technology", "Competition", "Workshop"],
    website: "https://hackthenight.example.com",
    details: {
      description:
        "Join teams to ideate, prototype, and demo solutions in a 24-hour sprint. Mentors and snacks included!",
      eligibility: "Open to all university students. Teams of 2–4 recommended.",
      schedule: "Sat 9:00 AM – Sun 9:00 AM",
      location: "Innovation Lab, Building A",
      fee: "Free",
      requiresRegistration: true,
      gallery: ["/hackathon-team.jpg", "/mentors-helping.jpg"],
    },
  },
  {
    slug: "film-fest",
    title: "Campus Film Fest",
    date: "Dec 5, 2025",
    tagline: "Short films from student creators",
    image: "/film-festival-screen.jpg",
    kind: "upcoming",
    tags: ["Arts", "Entertainment", "Community"],
    website: "https://filmfest.example.com",
    details: {
      description: "An evening of student-made films, followed by a Q&A with the creators and judges' awards.",
      eligibility: "Open to all. Submissions by current students only.",
      schedule: "Fri 6:00 PM – 9:00 PM",
      location: "Auditorium, Arts Center",
      fee: "Free for students, $5 for guests",
      requiresRegistration: false,
    },
  },
  {
    slug: "spring-fair-2025",
    title: "Spring Fair 2025",
    date: "Apr 7, 2025",
    tagline: "Food, music, and campus showcases",
    image: "/spring-fair-music.jpg",
    kind: "past",
    tags: ["Social", "Music", "Community"],
    details: {
      description: "A day-long celebration with club booths, performances, and local vendors across the quad.",
      eligibility: "Open to all.",
      schedule: "Mon 10:00 AM – 6:00 PM",
      location: "Main Quad",
      fee: "Free",
    },
  },
  {
    slug: "ai-guest-lecture",
    title: "AI Guest Lecture",
    date: "Sep 12, 2025",
    tagline: "Industry expert talk on AI ethics",
    image: "/lecture-hall.png",
    kind: "past",
    tags: ["Technology", "Workshop", "Academic"],
    details: {
      description: "A thought-provoking talk on responsible AI with live Q&A and networking afterwards.",
      eligibility: "Open to students and faculty.",
      schedule: "Thu 5:00 PM – 6:30 PM",
      location: "Science Building, Room 204",
      fee: "Free",
    },
  },
]
