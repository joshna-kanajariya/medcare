"use client";

import React, { useState, useEffect } from "react";
import { Search, X, User, Calendar, FileText, Filter, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "patient" | "appointment" | "record" | "staff";
  category: string;
  relevance: number;
  lastAccessed?: Date;
}

// Mock search data
const mockResults: SearchResult[] = [
  {
    id: "p001",
    title: "John Smith",
    subtitle: "Patient ID: 12345 • Room 302",
    type: "patient",
    category: "Active Patient",
    relevance: 95,
    lastAccessed: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: "a001", 
    title: "Cardiology Appointment",
    subtitle: "Dr. Johnson • Tomorrow 2:00 PM",
    type: "appointment",
    category: "Upcoming",
    relevance: 88,
    lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: "r001",
    title: "Blood Test Results",
    subtitle: "Jane Doe • Lab Report #789",
    type: "record",
    category: "Lab Results",
    relevance: 82,
    lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    id: "p002",
    title: "Jane Doe",
    subtitle: "Patient ID: 67890 • Room 205",
    type: "patient", 
    category: "Discharged",
    relevance: 79,
    lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: "s001",
    title: "Dr. Sarah Johnson",
    subtitle: "Cardiologist • Available",
    type: "staff",
    category: "On Duty",
    relevance: 75,
  },
  {
    id: "r002",
    title: "X-Ray Report",
    subtitle: "John Smith • Radiology #456",
    type: "record",
    category: "Imaging",
    relevance: 70,
    lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
  }
];

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ placeholder = "Search patients, appointments, records...", className }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { value: "all", label: "All", count: mockResults.length },
    { value: "patient", label: "Patients", count: mockResults.filter(r => r.type === "patient").length },
    { value: "appointment", label: "Appointments", count: mockResults.filter(r => r.type === "appointment").length },
    { value: "record", label: "Records", count: mockResults.filter(r => r.type === "record").length },
    { value: "staff", label: "Staff", count: mockResults.filter(r => r.type === "staff").length }
  ];

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      let filteredResults = mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      );

      if (selectedFilter !== "all") {
        filteredResults = filteredResults.filter(result => result.type === selectedFilter);
      }

      // Sort by relevance and recent access
      filteredResults.sort((a, b) => {
        if (a.relevance !== b.relevance) return b.relevance - a.relevance;
        if (a.lastAccessed && b.lastAccessed) {
          return b.lastAccessed.getTime() - a.lastAccessed.getTime();
        }
        return 0;
      });

      setResults(filteredResults);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedFilter]);

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return <User className="h-4 w-4 text-primary" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-secondary" />;
      case "record":
        return <FileText className="h-4 w-4 text-info" />;
      case "staff":
        return <User className="h-4 w-4 text-success" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 text-foreground">{part}</mark> : 
        part
    );
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          aria-label="Global search"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Search Results Panel */}
          <Card className="absolute top-12 left-0 right-0 z-50 max-h-96 overflow-hidden shadow-lg">
            {/* Filters */}
            <div className="border-b border-border p-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex space-x-1">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full transition-colors",
                        selectedFilter === filter.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span>Searching...</span>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {query.length < 2 ? 
                      "Type at least 2 characters to search" : 
                      "No results found"
                    }
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        className="w-full p-4 text-left hover:bg-accent transition-colors focus:bg-accent focus:outline-none"
                        onClick={() => {
                          // Handle result selection
                          console.log("Selected:", result);
                          setIsOpen(false);
                          setQuery("");
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground truncate">
                                {highlightText(result.title, query)}
                              </p>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  result.type === "patient" && "bg-primary/20 text-primary",
                                  result.type === "appointment" && "bg-secondary/20 text-secondary",
                                  result.type === "record" && "bg-info/20 text-info",
                                  result.type === "staff" && "bg-success/20 text-success"
                                )}>
                                  {result.category}
                                </span>
                                {result.lastAccessed && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(result.lastAccessed)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {highlightText(result.subtitle, query)}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-muted rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full" 
                                  style={{ width: `${result.relevance}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground ml-2">
                                {result.relevance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            {/* Footer */}
            {results.length > 0 && (
              <div className="border-t border-border p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Enter</kbd> to select, 
                  <kbd className="px-1 py-0.5 bg-background border rounded text-xs ml-1">Esc</kbd> to close
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}