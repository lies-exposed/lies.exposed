# AI Documentation

This section covers the AI processing architecture, LLM integration, and structured output requirements.

## Contents

- [OpenAI Structured Output](./openai-schemas.md) - Schema requirements for AI structured output

## AI Services Overview

The platform uses multiple AI services for content processing:

### AI-Bot Service

The primary AI processing engine that:
- Polls the queue for pending AI jobs
- Processes jobs using OpenAI/LLM models
- Extracts structured data from URLs and text
- Creates and updates events based on AI analysis

See [AI-Bot Service](../services/ai-bot.md) for details.

### Agent Service

LLM-powered conversational AI engine that:
- Provides chat-based interactions with LangChain/LangGraph
- Supports multiple AI providers (OpenAI, Anthropic, xAI)
- Integrates with MCP for tool access
- Streams responses via Server-Sent Events

See [Agent Service](../services/agent.md) for details.

## AI Providers

| Provider | Purpose | Configuration |
|----------|---------|---------------|
| **OpenAI** | Primary LLM processing | `OPENAI_API_KEY` |
| **Anthropic** | Claude model support | `ANTHROPIC_API_KEY` |
| **xAI** | Grok model support | `XAI_API_KEY` |
| **LocalAI** | Local model deployment | Service URL in config |

## MCP Integration

The API service implements an MCP (Model Context Protocol) server that exposes tools for AI agents:

- Actor management tools
- Group management tools
- Event creation and search tools
- Media and link tools
- BlockNote rich text tools

## AI Processing Workflows

### Content Analysis Pipeline

1. **Content Ingestion**: URLs, PDFs, and text are loaded
2. **Document Processing**: Content is chunked using LangChain
3. **Entity Extraction**: AI identifies actors, groups, locations
4. **Fact Verification**: Content is analyzed for accuracy
5. **Structured Output**: Results formatted as JSON

### Event Creation Workflow

1. **Source Analysis**: URLs or text analyzed for content
2. **Entity Recognition**: Relevant entities identified
3. **Temporal Analysis**: Dates and timelines extracted
4. **Relationship Mapping**: Connections established
5. **Fact Scoring**: Claims evaluated for veracity
6. **Publication**: Structured events created

## Queue System

AI jobs are processed through a file-based queue:

| Job Type | Description |
|----------|-------------|
| `openai-embedding` | Create embeddings |
| `openai-summarize` | Text summarization |
| `openai-create-event-from-url` | Extract event from URL |
| `openai-create-event-from-text` | Extract event from text |
| `openai-create-event-from-links` | Create event from links |
| `openai-update-event` | Update existing event |

## Quality Assurance

- **Multi-Model Validation**: Critical analyses use multiple AI models
- **Human Review**: Outputs flagged for review when confidence is low
- **Continuous Learning**: Models fine-tuned based on feedback
