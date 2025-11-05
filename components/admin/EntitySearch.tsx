"use client";

import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, User, FileText, Building2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityResult {
  id: string;
  type: string;
  name: string;
  displayText: string;
  subtitle: string;
  email?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

interface EntitySearchProps {
  value?: { entityType: string; entityId: string };
  onChange: (value: { entityType: string; entityId: string; displayText: string }) => void;
  entityTypeFilter?: string;
  placeholder?: string;
}

export function EntitySearch({ value, onChange, entityTypeFilter, placeholder = "Search by name, email, or ID..." }: EntitySearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<EntityResult | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (entityTypeFilter) {
          params.set("entityType", entityTypeFilter);
        }

        const response = await fetch(`/api/admin/search-entities?${params}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Error searching entities:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, entityTypeFilter]);

  const handleSelect = (result: EntityResult) => {
    setSelectedResult(result);
    onChange({
      entityType: result.type,
      entityId: result.id,
      displayText: result.displayText,
    });
    setOpen(false);
    setQuery("");
  };

  // Get icon based on entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "LOBBYIST":
        return <User className="h-4 w-4 text-blue-600" />;
      case "EMPLOYER":
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case "BOARD_MEMBER":
        return <Landmark className="h-4 w-4 text-green-600" />;
      case "LOBBYIST_REPORT":
      case "EMPLOYER_REPORT":
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  // Format the display text to be more user-friendly
  const formatSelectedDisplay = (result: EntityResult) => {
    return (
      <div className="flex items-center gap-2 min-w-0">
        {getEntityIcon(result.type)}
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{result.displayText}</span>
          <span className="text-xs text-muted-foreground truncate">
            {result.subtitle}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[2.5rem] py-2"
        >
          <div className="flex-1 min-w-0 text-left">
            {selectedResult ? (
              formatSelectedDisplay(selectedResult)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : query.length < 2 ? (
              <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-start gap-3 py-3 cursor-pointer"
                  >
                    <div className="mt-0.5">
                      {getEntityIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{result.displayText}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </div>
                      {result.email && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {result.email}
                        </div>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selectedResult?.id === result.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
