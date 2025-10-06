"use client"

import React, { useEffect, useRef, useState } from "react"

const TestPage = () => {
  const [apiResults, setApiResults] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})

  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)
  const section4Ref = useRef<HTMLDivElement>(null)
  const section5Ref = useRef<HTMLDivElement>(null)

  const apiCalled = useRef<Set<number>>(new Set())

  // Mock API call function with varying setTimeout delays
  const callAPI = async (sectionNumber: number) => {
    if (apiCalled.current.has(sectionNumber)) {
      console.log(`API ${sectionNumber} already called, skipping...`)
      return
    }

    apiCalled.current.add(sectionNumber)
    setLoading((prev) => ({ ...prev, [sectionNumber]: true }))

    // Different delays for each section (in milliseconds)
    const delays = [500, 2000, 3000, 1500, 3000]
    const delay = delays[sectionNumber - 1]

    console.log(`🚀 Calling API ${sectionNumber}... (${delay}ms delay)`)

    try {
      // Simulate API call with setTimeout Promise
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Mock data response
      const data = {
        id: sectionNumber,
        userId: sectionNumber,
        title: `Data for Section ${sectionNumber}`,
        body: `This is mock data loaded after ${delay}ms delay. The Intersection Observer triggered this API call when you scrolled near section ${sectionNumber}.`,
        loadTime: `${delay}ms`,
      }

      setApiResults((prev) => ({ ...prev, [sectionNumber]: data }))
      console.log(`✅ API ${sectionNumber} completed after ${delay}ms:`, data)
    } catch (error) {
      console.error(`❌ API ${sectionNumber} failed:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, [sectionNumber]: false }))
    }
  }

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "200px", // Fire API when section is 200px away from viewport
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionNumber = parseInt(
            entry.target.getAttribute("data-section") || "0"
          )
          callAPI(sectionNumber)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    const sections = [
      section1Ref,
      section2Ref,
      section3Ref,
      section4Ref,
      section5Ref,
    ]
    sections.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    // Cleanup
    return () => {
      sections.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  const sections = [
    {
      ref: section1Ref,
      number: 1,
      color: "from-indigo-500 to-purple-600",
      title: "Section 1",
    },
    {
      ref: section2Ref,
      number: 2,
      color: "from-purple-500 to-pink-600",
      title: "Section 2",
    },
    {
      ref: section3Ref,
      number: 3,
      color: "from-pink-500 to-rose-600",
      title: "Section 3",
    },
    {
      ref: section4Ref,
      number: 4,
      color: "from-rose-500 to-orange-600",
      title: "Section 4",
    },
    {
      ref: section5Ref,
      number: 5,
      color: "from-orange-500 to-yellow-600",
      title: "Section 5",
    },
  ]

  return (
    <div className="w-full">
      {sections.map((section) => (
        <div
          key={section.number}
          ref={section.ref}
          data-section={section.number}
          className={`h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br ${section.color} text-white relative`}
        >
          <div className="max-w-2xl w-full px-8">
            <h1 className="text-6xl font-bold mb-4">{section.title}</h1>
            <p className="text-xl mb-8 opacity-90">
              Scroll down to trigger the next API call
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  API Call {section.number}
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    loading[section.number]
                      ? "bg-yellow-500"
                      : apiResults[section.number]
                      ? "bg-green-500"
                      : "bg-slate-500"
                  }`}
                >
                  {loading[section.number]
                    ? "Loading..."
                    : apiResults[section.number]
                    ? "Loaded"
                    : "Pending"}
                </div>
              </div>

              {loading[section.number] && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <p className="text-sm">Fetching data...</p>
                </div>
              )}

              {apiResults[section.number] && (
                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-xs opacity-70 mb-1">Title:</p>
                    <p className="font-medium">
                      {apiResults[section.number].title}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-xs opacity-70 mb-1">Body:</p>
                    <p className="text-sm opacity-90">
                      {apiResults[section.number].body}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-white/20 px-2 py-1 rounded">
                      Load Time: {apiResults[section.number].loadTime}
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded">
                      Section: {apiResults[section.number].id}
                    </span>
                  </div>
                </div>
              )}

              {!loading[section.number] && !apiResults[section.number] && (
                <p className="text-sm opacity-70">
                  Scroll near this section to trigger the API call
                </p>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg
              className="w-6 h-6 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TestPage
