import * as React from "react";

/**
 * Props for making graphs accessible
 */
export interface GraphA11yWrapperProps {
  /** Unique identifier for the graph */
  id: string;
  /** Title of the graph (used as aria-label) */
  title: string;
  /** Detailed description of what the graph shows */
  description: string;
  /** The SVG graph element to wrap */
  children: React.ReactNode;
  /** Tabular representation of the data (for screen readers) */
  dataTable?: React.ReactNode;
  /** Alternative text link to download data as CSV or JSON */
  dataDownloadUrl?: string;
  /** Role of the graphic (default: 'img' for static images) */
  role?: "img" | "region" | "figure";
}

/**
 * Wrapper component that adds WCAG 2.1 AA accessibility features to SVG graphs
 *
 * This wrapper:
 * - Adds semantic ARIA roles and labels
 * - Provides screen reader descriptions
 * - Includes keyboard-accessible data table alternative
 * - Supports data download functionality
 * - Ensures focus management
 *
 * @example
 * ```tsx
 * <GraphA11yWrapper
 *   id="population-chart"
 *   title="World Population Growth 1960-2023"
 *   description="Line chart showing steady population increase from 3 billion to 8 billion"
 *   dataTable={<PopulationTable />}
 * >
 *   <PopulationGraph />
 * </GraphA11yWrapper>
 * ```
 */
export const GraphA11yWrapper: React.FC<GraphA11yWrapperProps> = ({
  id,
  title,
  description,
  children,
  dataTable,
  dataDownloadUrl,
  role = "img",
}) => {
  const descriptionId = `${id}-description`;
  const tableId = `${id}-table`;

  return (
    <figure
      style={{
        margin: 0,
        padding: "1rem 0",
      }}
    >
      {/* Main SVG graph with accessibility attributes */}
      <div
        style={{
          position: "relative",
          marginBottom: dataTable ? "2rem" : "0",
        }}
      >
        <div
          role={role}
          aria-label={title}
          aria-describedby={descriptionId}
          tabIndex={0}
          style={{
            outline: "none",
            borderRadius: "4px",
          }}
          onKeyDown={(e) => {
            // Allow focus on the graph for keyboard navigation
            if (e.key === "Tab") {
              e.currentTarget.style.outline = "2px solid #000";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          {children}
        </div>
      </div>

      {/* Screen reader only description */}
      <div
        id={descriptionId}
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        {description}
      </div>

      {/* Caption for the figure */}
      <figcaption
        style={{
          fontSize: "0.875rem",
          color: "#666",
          marginTop: "0.5rem",
        }}
      >
        <strong>{title}</strong>
        <p style={{ margin: "0.5rem 0 0 0" }}>{description}</p>
      </figcaption>

      {/* Keyboard-accessible data table alternative */}
      {dataTable && (
        <details
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              userSelect: "none",
              padding: "0.5rem",
            }}
          >
            View data table
          </summary>
          <div
            id={tableId}
            style={{
              marginTop: "1rem",
              overflow: "auto",
            }}
          >
            {dataTable}
          </div>
        </details>
      )}

      {/* Data download link */}
      {dataDownloadUrl && (
        <div style={{ marginTop: "1rem" }}>
          <a
            href={dataDownloadUrl}
            download
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#0066cc",
              fontSize: "0.875rem",
            }}
          >
            Download data (CSV/JSON)
          </a>
        </div>
      )}
    </figure>
  );
};
