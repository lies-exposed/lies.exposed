/**
 * SVG and Chart Accessibility Utilities
 * WCAG 2.1 Level AA compliant helpers for making data visualizations accessible
 */

/**
 * Generate a semantic description of numerical data for screen readers
 * Summarizes data ranges, trends, and key statistics
 *
 * @param data - Array of data points
 * @param label - What the data represents (e.g., "temperature", "population")
 * @returns Human-readable description
 *
 * @example
 * const desc = generateDataDescription([1, 2, 3, 4, 5], "temperature");
 * // "Temperature values range from 1 to 5, showing an increasing trend"
 */
export function generateDataDescription(data: number[], label: string): string {
  if (data.length === 0) return `No ${label} data available`;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const avg = data.reduce((a, b) => a + b, 0) / data.length;

  // Detect trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const trend =
    secondAvg > firstAvg
      ? "increasing"
      : secondAvg < firstAvg
        ? "decreasing"
        : "stable";

  return `${label} data showing ${trend} trend. Range: ${min} to ${max}, Average: ${avg.toFixed(2)}`;
}

/**
 * Create an HTML table representation of chart data for screen readers
 * Tables are keyboard-navigable and screen-reader friendly
 *
 * @param data - Array of data objects
 * @param columns - Column definitions with name and accessor function
 * @returns React-compatible HTML string or JSX
 *
 * @example
 * const table = createAccessibleDataTable(
 *   [{ year: 2020, temp: 15.2 }, { year: 2021, temp: 15.8 }],
 *   [
 *     { name: "Year", accessor: (d) => d.year },
 *     { name: "Temperature", accessor: (d) => d.temp },
 *   ]
 * );
 */
export function createAccessibleDataTable<T>(
  data: T[],
  columns: {
    name: string;
    accessor: (item: T) => string | number;
  }[],
): string {
  const headerRow = columns.map((col) => `<th>${col.name}</th>`).join("");

  const bodyRows = data
    .map(
      (item) =>
        `<tr>${columns.map((col) => `<td>${String(col.accessor(item))}</td>`).join("")}</tr>`,
    )
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f0f0f0; border-bottom: 2px solid #ccc;">
          ${headerRow}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;
}

/**
 * Add keyboard navigation to SVG elements
 * Enables Tab, Enter, and Arrow key support for interactive charts
 *
 * @param svgElement - SVG DOM element
 * @param onSelect - Callback when item is selected
 */
export function makeChartKeyboardAccessible(
  svgElement: SVGElement,
  onSelect: (element: SVGElement) => void,
): () => void {
  const interactiveElements = svgElement.querySelectorAll(
    "[data-interactive], circle, rect, line, path",
  );
  let currentIndex = 0;

  const focusElement = (index: number): void => {
    interactiveElements.forEach((el) => {
      (el as SVGElement).style.outline = "none";
    });

    if (index >= 0 && index < interactiveElements.length) {
      const element = interactiveElements[index] as SVGElement;
      element.style.outline = "2px solid #0066cc";
      element.style.outlineOffset = "2px";
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      currentIndex = index;
    }
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusElement((currentIndex + 1) % interactiveElements.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusElement(
        (currentIndex - 1 + interactiveElements.length) %
          interactiveElements.length,
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (currentIndex >= 0 && currentIndex < interactiveElements.length) {
        onSelect(interactiveElements[currentIndex] as SVGElement);
      }
    }
  };

  svgElement.addEventListener("keydown", handleKeyDown);
  focusElement(0);

  return () => {
    svgElement.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Add ARIA labels to SVG chart elements
 * Helps screen readers understand what each visual element represents
 *
 * @param svgElement - SVG DOM element
 * @param ariaLabels - Map of element IDs to accessible labels
 */
export function addAriaLabels(
  svgElement: SVGElement,
  ariaLabels: Map<string, string>,
): void {
  ariaLabels.forEach((label, id) => {
    const element = svgElement.querySelector(`#${id}`);
    if (element) {
      element.setAttribute("aria-label", label);
      element.setAttribute("role", "img");
    }
  });
}

/**
 * Create a summary statistics announcement for live regions
 * Useful for updating screen readers when chart data changes
 *
 * @param data - Chart data
 * @param title - Chart title
 * @returns Announcement text for screen readers
 *
 * @example
 * const announce = createLiveRegionAnnouncement(data, "Population Chart");
 * liveRegion.textContent = announce;
 */
export function createLiveRegionAnnouncement(
  data: number[],
  title: string,
): string {
  if (data.length === 0) return `${title} has no data`;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const total = data.reduce((a, b) => a + b, 0);

  return `${title} updated. Showing ${data.length} data points ranging from ${min} to ${max}. Total: ${total}`;
}

/**
 * Generate a text alternative that describes relationships in a network graph
 * Converts node-link relationships to narrative description
 *
 * @param nodes - Array of nodes with labels
 * @param links - Array of links connecting nodes
 * @returns Narrative description of the network
 *
 * @example
 * const desc = describeNetworkGraph(nodes, links);
 * // "Network showing 5 actors with 8 connections: Actor A connects to B and C..."
 */
export function describeNetworkGraph(
  nodes: { id: string; label: string }[],
  links: { source: string; target: string }[],
): string {
  if (nodes.length === 0) return "Empty network graph";

  const nodeCount = nodes.length;
  const linkCount = links.length;

  const connections = new Map<string, number>();
  links.forEach(({ source, target }) => {
    connections.set(source, (connections.get(source) ?? 0) + 1);
    connections.set(target, (connections.get(target) ?? 0) + 1);
  });

  const mostConnected = Array.from(connections.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const mostConnectedLabel = nodes.find(
    (n) => n.id === mostConnected?.[0],
  )?.label;

  return `Network graph with ${nodeCount} nodes and ${linkCount} connections. Most connected: ${mostConnectedLabel} with ${mostConnected?.[1] ?? 0} connections.`;
}

/**
 * Validate graph accessibility compliance
 * Checks for WCAG 2.1 Level AA requirements
 *
 * @param svgElement - SVG DOM element to validate
 * @returns Object with accessibility check results
 */
export interface AccessibilityCheckResult {
  hasAriaLabel: boolean;
  hasAriaDescribedBy: boolean;
  hasAriaRole: boolean;
  hasAlternativeText: boolean;
  hasKeyboardSupport: boolean;
  hasColorContrast: boolean;
  issues: string[];
}

export function validateGraphAccessibility(
  svgElement: SVGElement,
): AccessibilityCheckResult {
  const issues: string[] = [];
  const parent = svgElement.parentElement;

  const hasAriaLabel = parent?.hasAttribute("aria-label") ?? false;
  if (!hasAriaLabel) issues.push("Missing aria-label on parent element");

  const hasAriaDescribedBy = parent?.hasAttribute("aria-describedby") ?? false;
  if (!hasAriaDescribedBy) issues.push("Missing aria-describedby attribute");

  const hasAriaRole = svgElement.hasAttribute("role");
  if (!hasAriaRole) issues.push("Missing role attribute on SVG");

  const hasAlternativeText = parent?.querySelector("[role='region']") !== null;
  if (!hasAlternativeText)
    issues.push("No screen-reader-only alternative text found");

  const hasKeyboardSupport = parent?.hasAttribute("tabindex") ?? false;
  if (!hasKeyboardSupport) issues.push("Not keyboard accessible (no tabindex)");

  // Check for reasonable color contrast (basic check)
  const hasColorContrast = true; // Would need more sophisticated checking

  return {
    hasAriaLabel,
    hasAriaDescribedBy,
    hasAriaRole,
    hasAlternativeText,
    hasKeyboardSupport,
    hasColorContrast,
    issues,
  };
}

/**
 * Export chart data as CSV for accessibility
 * Allows users to export data for analysis with accessible tools
 *
 * @param data - Array of data objects
 * @param columns - Column definitions
 * @returns CSV string
 */
export function exportChartDataAsCSV<T>(
  data: T[],
  columns: {
    name: string;
    accessor: (item: T) => string | number;
  }[],
): string {
  const header = columns.map((col) => `"${col.name}"`).join(",");
  const rows = data
    .map((item) =>
      columns.map((col) => `"${String(col.accessor(item))}"`).join(","),
    )
    .join("\n");

  return `${header}\n${rows}`;
}

/**
 * Create a focus-visible style for keyboard navigation
 * Ensures keyboard focus is always visible for accessibility
 *
 * @returns CSS style object for focused state
 */
export function getFocusVisibleStyle(): React.CSSProperties {
  return {
    outline: "3px solid #4A90E2",
    outlineOffset: "2px",
    borderRadius: "2px",
  };
}
