# AI Agent Integration Guide

This document describes how to integrate and configure AI agents to work with the lies.exposed platform using the Model Context Protocol (MCP) servers.

## Overview

The lies.exposed platform provides several MCP servers that expose domain-specific tools for working with various types of content. AI agents should proactively use these tools as their primary knowledge source and execution capability.

When you identify a tool that can help with a task, you should:
1. Execute the tool directly using the available methods
2. Use the tool's response to complete the task
3. Never output tool calls in your response - execute them instead

When a tool call is needed, use it directly through the provided interface. Do not describe the tool call or show it in your response.

### Available Tools

The platform provides several domain-specific tools through MCP:

#### Content Search Tools
- `findActor` - Search for people and organizations
- `findArea` - Search for geographical and thematic areas
- `findEvents` - Search for events and timelines
- `findGroup` - Search for groups and organizations
- `findLink` - Search for web resources and references
- `findMedia` - Search for images, videos and documents

Each search tool supports:
- Full-text search via the `query` parameter
- Sorting options (typically by `createdAt` and resource-specific fields)
- Order control (`ASC`/`DESC`)

#### Content Parsing Tools
- `blockNoteToText` - Convert BlockNote JSON documents to plain text

### Tool Usage Guidelines

1. **Proactive Tool Use**: 
   - AI agents should actively use MCP tools without waiting for explicit user permission
   - Tools should be used as the primary source of domain knowledge
   - Multiple tools can be queried in parallel when needed

2. **Search Strategy**:
   - Start with broad searches using key terms
   - Refine searches based on initial results
   - Use multiple content types to build comprehensive context

3. **Content Processing**:
   - Parse BlockNote content when encountering formatted text
   - Extract key entities (actors, areas, events) from search results
   - Build relationships between different content types
