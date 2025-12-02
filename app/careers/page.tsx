"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Users } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Fashion Designer",
      department: "Design",
      location: "New York, NY",
      type: "Full-time"
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Los Angeles, CA",
      type: "Full-time"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Join Our Team</h1>
            <p className="text-muted-foreground">Build the future of fashion with us</p>
          </div>

          <GlassCard className="p-8 mb-8">
            <h2 className="font-semibold text-2xl mb-4">Why Work at Arnova?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Great Team</h3>
                <p className="text-sm text-muted-foreground">Work with passionate, talented people</p>
              </div>
              <div className="text-center">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Work-Life Balance</h3>
                <p className="text-sm text-muted-foreground">Flexible hours and remote options</p>
              </div>
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Global Impact</h3>
                <p className="text-sm text-muted-foreground">Shape fashion for customers worldwide</p>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <h2 className="font-semibold text-2xl mb-6">Open Positions</h2>
            {jobs.map((job, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <Button>Apply Now</Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}