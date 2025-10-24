"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { useAuth } from "@/hooks/use-auth"
import "leaflet/dist/leaflet.css"
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap").then(mod => mod.LocationPickerMap), {
  ssr: false,
})

export default function NewIssuePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setLatLng = (lat: number, lng: number) => {
    setLat(lat)
    setLng(lng)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !category || !location || lat === null || lng === null) {
      toast.error("Please fill in all required fields"
      )
      return
    }

    if (location.length > 100) {
      toast.error("Please provide a shorter location name")
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = null

      // Upload image if provided
      if (image) {
        const formData = new FormData()
        formData.append("file", image)
        formData.append("upload_preset", "unsigned_preset")

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        )

        const cloudinaryData = await cloudinaryResponse.json()

        if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
          throw new Error("Image upload failed. Please try again.")
        }

        imageUrl = cloudinaryData.secure_url
      }

      // Submit issue to backend
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          latitude: lat,
          longitude: lng,
          imageUrl,
          createdBy: user?.id || "",
          status: "Pending",
        }),
      })

      if (response.status === 429) {
        toast.error("You’ve reached your daily issue report limit. Try again in 24 hours.")
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.error || "Something went wrong. Try again later.")
      }

      toast.success("Your issue has been successfully submitted! +10 points earned! 🎉")

      router.push("/my-issues")
    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error("An unknown error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="container py-8">
      <Link href="/issues">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to issues
        </Button>
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
            <CardDescription>
              Provide details about the issue you want to report
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-24 overflow-y-auto">
                    <SelectItem value="Road">Road</SelectItem>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Sanitation">Sanitation</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Sector 15, Chandigarh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  To fill the location automatically, please select a location on map.
                </p>
              </div>


              <LocationPickerMap
                lat={lat}
                lng={lng}
                setLatLng={setLatLng}
                setLocationText={setLocation}
                location={location}
              />

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed explanation of the issue"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full h-32 border-dashed flex flex-col items-center justify-center"
                  >
                    <ImagePlus className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload
                    </span>
                  </Button>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {imagePreview && (
                    <div className="relative h-32 w-32 rounded-md overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => {
                          setImage(null)
                          setImagePreview(null)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image of the issue (max 5MB)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </CardFooter>

          </form>
        </Card>

      </div>
    </div>
  )
}