import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="border-b bg-white px-4 py-2" aria-label="Breadcrumb">
      <div className="mx-auto max-w-7xl">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link
              href="/dashboard"
              className="flex items-center text-gray-500 transition-colors hover:text-gray-700"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
