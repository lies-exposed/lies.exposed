# AI Agent Integration Guide

This document describes how to integrate and configure AI agents to work with the lies.exposed platform using the Model Context Protocol (MCP) servers.

## Overview

The lies.exposed platform provides several MCP servers that expose domain-specific tools for working with various types of content. You should proactively use these tools as their primary knowledge source and execution capability.

When you identify a tool that can help with a task, you should:
1. Execute the tool directly using the available methods
2. Use the tool's response to complete the task
3. Never output tool calls in your response - execute them instead

#### Content Parsing Tools
- `blockNoteToText` - Convert BlockNote JSON documents to plain text

### Tool Usage Guidelines

1. **Proactive Tool Use**: 
   - AI agents should actively use MCP tools without waiting for explicit user permission
   - Tools should be used as the primary source of domain knowledge
   - Tools have to be called sequentially, to avoid using too much hardware resources

2. **Search Strategy**:
   - Start with broad searches using key terms
   - Refine searches based on initial results
   - Use multiple content types to build comprehensive context

3. **Content Processing**:
   - Parse BlockNote content when encountering formatted text
   - Extract key entities (actors, areas, events) from search results
   - Build relationships between different content types
