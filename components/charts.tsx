"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import type { IssueCategory } from "@/lib/data"

// Donut Chart Component
export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Colors based on theme
    const colors = {
      Road: theme === "dark" ? "#f97316" : "#fb923c", // Orange
      Water: theme === "dark" ? "#0ea5e9" : "#38bdf8", // Blue
      Sanitation: theme === "dark" ? "#10b981" : "#34d399", // Green
      Electricity: theme === "dark" ? "#8b5cf6" : "#a78bfa", // Purple
      Other: theme === "dark" ? "#64748b" : "#94a3b8", // Slate
    }

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw donut chart
    let startAngle = 0
    data.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.value) / total

      // Draw slice
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.arc(centerX, centerY, radius * 0.6, startAngle + sliceAngle, startAngle, true)
      ctx.closePath()

      // Fill with color
      ctx.fillStyle = colors[item.name as IssueCategory] || "#cbd5e1"
      ctx.fill()

      // Add stroke
      ctx.strokeStyle = theme === "dark" ? "#1e293b" : "#f8fafc"
      ctx.lineWidth = 1
      ctx.stroke()

      // Calculate label position
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.8
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      // Draw label if slice is big enough
      if (sliceAngle > 0.2) {
        ctx.fillStyle = theme === "dark" ? "#f8fafc" : "#1e293b"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(item.name, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = 20
    let legendY = canvas.height - data.length * 25 - 10

    data.forEach((item) => {
      // Draw color box
      ctx.fillStyle = colors[item.name as IssueCategory] || "#cbd5e1"
      ctx.fillRect(legendX, legendY, 15, 15)

      // Draw text
      ctx.fillStyle = theme === "dark" ? "#f8fafc" : "#1e293b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`${item.name}: ${item.value}`, legendX + 25, legendY + 7.5)

      legendY += 25
    })
  }, [data, theme])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-full"
      onClick={() => {
        toast({
          title: "Chart interaction",
          description: "In a real app, this would show detailed analytics",
        })
      }}
    />
  )
}

// Line Chart Component
export function LineChart({ data }: { data: { date: string; count: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and padding
    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Find max value for scaling
    const maxCount = Math.max(...data.map((d) => d.count), 5)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = theme === "dark" ? "#475569" : "#cbd5e1"
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)

    // Y-axis
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.stroke()

    // Draw Y-axis labels and grid lines
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = theme === "dark" ? "#cbd5e1" : "#475569"
    ctx.font = "10px sans-serif"

    for (let i = 0; i <= 5; i++) {
      const value = (maxCount / 5) * i
      const y = canvas.height - padding.bottom - (chartHeight * i) / 5

      // Grid line
      ctx.beginPath()
      ctx.strokeStyle = theme === "dark" ? "#334155" : "#f1f5f9"
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()

      // Label
      ctx.fillText(Math.round(value).toString(), padding.left - 5, y)
    }

    // Draw X-axis labels
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    data.forEach((d, i) => {
      const x = padding.left + (chartWidth * i) / (data.length - 1)
      const date = new Date(d.date)
      const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" })

      ctx.fillText(label, x, canvas.height - padding.bottom + 10)

      // Tick mark
      ctx.beginPath()
      ctx.strokeStyle = theme === "dark" ? "#475569" : "#cbd5e1"
      ctx.moveTo(x, canvas.height - padding.bottom)
      ctx.lineTo(x, canvas.height - padding.bottom + 5)
      ctx.stroke()
    })

    // Draw line chart
    ctx.beginPath()
    ctx.strokeStyle = theme === "dark" ? "#3b82f6" : "#2563eb"
    ctx.lineWidth = 2

    data.forEach((d, i) => {
      const x = padding.left + (chartWidth * i) / (data.length - 1)
      const y = canvas.height - padding.bottom - (chartHeight * d.count) / maxCount

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth * i) / (data.length - 1)
      const y = canvas.height - padding.bottom - (chartHeight * d.count) / maxCount

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = theme === "dark" ? "#3b82f6" : "#2563eb"
      ctx.fill()
      ctx.strokeStyle = theme === "dark" ? "#1e293b" : "#ffffff"
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Chart title
    ctx.fillStyle = theme === "dark" ? "#f8fafc" : "#1e293b"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Daily Issue Reports", canvas.width / 2, 10)
  }, [data, theme])

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />
}

// Bar Chart Component
export function BarChart({ data }: { data: { id: string; title: string; category: string; votes: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and padding
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Bar properties
    const barCount = data.length
    const barWidth = (chartWidth / barCount) * 0.7
    const barSpacing = (chartWidth / barCount) * 0.3

    // Find max value for scaling
    const maxVotes = Math.max(...data.map((d) => d.votes), 10)

    // Colors based on theme and category
    const colors = {
      Road: theme === "dark" ? "#f97316" : "#fb923c", // Orange
      Water: theme === "dark" ? "#0ea5e9" : "#38bdf8", // Blue
      Sanitation: theme === "dark" ? "#10b981" : "#34d399", // Green
      Electricity: theme === "dark" ? "#8b5cf6" : "#a78bfa", // Purple
      Other: theme === "dark" ? "#64748b" : "#94a3b8", // Slate
    }

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = theme === "dark" ? "#475569" : "#cbd5e1"
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)

    // Y-axis
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.stroke()

    // Draw Y-axis labels and grid lines
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = theme === "dark" ? "#cbd5e1" : "#475569"
    ctx.font = "10px sans-serif"

    for (let i = 0; i <= 5; i++) {
      const value = (maxVotes / 5) * i
      const y = canvas.height - padding.bottom - (chartHeight * i) / 5

      // Grid line
      ctx.beginPath()
      ctx.strokeStyle = theme === "dark" ? "#334155" : "#f1f5f9"
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()

      // Label
      ctx.fillText(Math.round(value).toString(), padding.left - 5, y)
    }

    // Draw bars and labels
    data.forEach((d, i) => {
      const barHeight = (chartHeight * d.votes) / maxVotes
      const x = padding.left + (chartWidth * i) / barCount + barSpacing / 2
      const y = canvas.height - padding.bottom - barHeight

      // Draw bar
      ctx.fillStyle = colors[d.category as IssueCategory] || "#cbd5e1"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw border
      ctx.strokeStyle = theme === "dark" ? "#1e293b" : "#f8fafc"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // Draw vote count on top of bar
      ctx.fillStyle = theme === "dark" ? "#f8fafc" : "#1e293b"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(d.votes.toString(), x + barWidth / 2, y - 5)

      // Draw truncated title below bar
      ctx.fillStyle = theme === "dark" ? "#cbd5e1" : "#475569"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      const title = d.title.length > 15 ? d.title.substring(0, 12) + "..." : d.title
      ctx.fillText(title, x + barWidth / 2, canvas.height - padding.bottom + 10)
    })

    // Chart title
    ctx.fillStyle = theme === "dark" ? "#f8fafc" : "#1e293b"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Top Issues by Votes", canvas.width / 2, 10)
  }, [data, theme])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="w-full h-full"
      onClick={() => {
        toast({
          title: "Chart interaction",
          description: "In a real app, clicking would show issue details",
        })
      }}
    />
  )
}
