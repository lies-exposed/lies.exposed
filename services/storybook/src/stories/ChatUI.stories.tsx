import { type ChatMessage } from "@liexp/shared/lib/io/http/Chat.js";
import { ChatUI } from "@liexp/ui/lib/components/Chat/ChatUI.js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

const meta: Meta<typeof ChatUI> = {
  title: "Components/ChatUI",
  component: ChatUI,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatUI>;

// Interactive wrapper component to handle state
const InteractiveChatUI = (args: typeof ChatUI.arguments) => {
  const [isOpen, setIsOpen] = useState(args.isOpen ?? false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(args.messages ?? []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a simulated response from the AI assistant.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ChatUI
      {...args}
      isOpen={isOpen}
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      onToggle={() => setIsOpen(!isOpen)}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      onKeyPress={handleKeyPress}
    />
  );
};

// Empty chat (welcome message)
export const Empty: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [],
    inputValue: "",
    isLoading: false,
    error: null,
    welcomeMessage: "Welcome! I'm your AI assistant. How can I help you today?",
  },
};

// Chat with user message only
export const UserMessage: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Hello, can you help me with something?",
        timestamp: new Date().toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Chat with conversation (user + assistant)
export const Conversation: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Hello, can you help me with fact-checking?",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Of course! I can help you verify information, find sources, and analyze claims. Here's what I can do:\n\n- **Verify facts** and claims\n- Find credible sources\n- Analyze historical events\n- Cross-reference information\n\nWhat would you like to fact-check?",
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: "3",
        role: "user",
        content:
          "I heard that climate change is causing more extreme weather events.",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "4",
        role: "assistant",
        content:
          "Yes, that's scientifically supported. According to the **IPCC** (Intergovernmental Panel on Climate Change), there is strong evidence:\n\n1. Climate change is increasing the frequency of extreme weather events\n2. Intensity of events like heatwaves is rising\n3. Heavy rainfall and droughts are more common\n\nYou can read more in their [latest report](https://www.ipcc.ch).",
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Chat with system message
export const WithSystemMessage: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "system",
        content: "Chat session started. All messages are encrypted.",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        role: "user",
        content: "Can you see this message?",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "3",
        role: "assistant",
        content: "Yes, I can see your message clearly!",
        timestamp: new Date().toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Chat with tool message (function call result)
export const WithToolMessage: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Search for recent news about renewable energy",
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: "2",
        role: "tool",
        content: JSON.stringify(
          {
            tool: "search_articles",
            arguments: JSON.stringify({
              query: "renewable energy",
              category: "news",
              limit: 3,
              sort_by: "date",
            }),
            result: JSON.stringify({
              success: true,
              articles: [
                {
                  title: "Solar power capacity increases by 30%",
                  url: "https://example.com/solar-power",
                  date: "2025-11-15",
                },
                {
                  title: "Wind farms reach record efficiency",
                  url: "https://example.com/wind-farms",
                  date: "2025-11-14",
                },
                {
                  title: "New battery technology breakthrough",
                  url: "https://example.com/battery-tech",
                  date: "2025-11-13",
                },
              ],
              total_results: 15,
            }),
          },
          null,
          2,
        ),
        timestamp: new Date(Date.now() - 120000).toISOString(),
        tool_call_id: "call_123",
      },
      {
        id: "3",
        role: "assistant",
        content:
          "I found 15 recent articles about renewable energy. Here are the top 3:\n\n1. **Solar power capacity increases by 30%** ([Read more](https://example.com/solar-power))\n2. **Wind farms reach record efficiency** ([Read more](https://example.com/wind-farms))\n3. **New battery technology breakthrough** ([Read more](https://example.com/battery-tech))\n\nWould you like me to search for more specific information?",
        timestamp: new Date().toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Loading state
export const Loading: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Tell me about artificial intelligence",
        timestamp: new Date().toISOString(),
      },
    ],
    inputValue: "",
    isLoading: true,
  },
};

// Error state
export const WithError: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Hello?",
        timestamp: new Date().toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
    error: "Failed to send message. Please try again.",
  },
};

// Long conversation with scrolling
export const LongConversation: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "What is fact-checking?",
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Fact-checking is the process of verifying factual information to promote the publication of only accurate and truthful information.",
        timestamp: new Date(Date.now() - 540000).toISOString(),
      },
      {
        id: "3",
        role: "user",
        content: "Why is it important?",
        timestamp: new Date(Date.now() - 480000).toISOString(),
      },
      {
        id: "4",
        role: "assistant",
        content:
          "Fact-checking is crucial because:\n1. It combats misinformation\n2. Helps people make informed decisions\n3. Maintains journalistic integrity\n4. Protects public discourse",
        timestamp: new Date(Date.now() - 420000).toISOString(),
      },
      {
        id: "5",
        role: "user",
        content: "How do fact-checkers verify information?",
        timestamp: new Date(Date.now() - 360000).toISOString(),
      },
      {
        id: "6",
        role: "assistant",
        content:
          "Fact-checkers use multiple methods:\n- Cross-referencing with primary sources\n- Consulting experts\n- Reviewing official records\n- Analyzing data and statistics\n- Investigating claims systematically",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "7",
        role: "user",
        content: "Can you give me an example?",
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: "8",
        role: "assistant",
        content:
          "Sure! If someone claims 'unemployment is at an all-time low,' a fact-checker would:\n1. Find official employment statistics\n2. Compare current rates to historical data\n3. Verify the timeframe and region\n4. Rate the claim's accuracy",
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Closed state (floating button)
export const Closed: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: false,
    messages: [],
    inputValue: "",
    isLoading: false,
  },
};

// Markdown formatting showcase
export const MarkdownFormatting: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Can you show me different markdown formatting?",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        role: "assistant",
        content: `Sure! Here are some examples:

# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

Here's a list:
- Item one
- Item two
  - Nested item
- Item three

Numbered list:
1. First
2. Second
3. Third

Inline \`code\` and code block:

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

> This is a blockquote
> spanning multiple lines

And a [link to our website](https://lies.exposed).

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Tables | ✅ |
| Links | ✅ |`,
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Multiple tool calls showcase
export const MultipleToolCalls: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "What actors are related to climate change events?",
        timestamp: new Date(Date.now() - 400000).toISOString(),
      },
      {
        id: "2",
        role: "tool",
        content: JSON.stringify(
          {
            tool: "findActors",
            arguments: JSON.stringify({
              query: "climate change",
              limit: 3,
            }),
            result: JSON.stringify({
              actors: [
                { id: "1", fullName: "Greta Thunberg", type: "Person" },
                { id: "2", fullName: "Al Gore", type: "Person" },
                { id: "3", fullName: "IPCC", type: "Organization" },
              ],
              count: 3,
            }),
          },
          null,
          2,
        ),
        timestamp: new Date(Date.now() - 300000).toISOString(),
        tool_call_id: "call_456",
      },
      {
        id: "3",
        role: "tool",
        content: JSON.stringify(
          {
            tool: "findEvents",
            arguments: JSON.stringify({
              query: "climate change",
              actors: ["1", "2", "3"],
              limit: 2,
            }),
            result: JSON.stringify({
              events: [
                {
                  id: "e1",
                  title: "Paris Climate Agreement",
                  date: "2015-12-12",
                  type: "Treaty",
                },
                {
                  id: "e2",
                  title: "IPCC Special Report on 1.5°C",
                  date: "2018-10-08",
                  type: "ScientificStudy",
                },
              ],
              count: 2,
            }),
          },
          null,
          2,
        ),
        timestamp: new Date(Date.now() - 240000).toISOString(),
        tool_call_id: "call_789",
      },
      {
        id: "4",
        role: "assistant",
        content:
          "I found **3 key actors** related to climate change:\n\n- **Greta Thunberg** (Person)\n- **Al Gore** (Person)\n- **IPCC** (Organization)\n\nAnd **2 significant events**:\n\n1. **Paris Climate Agreement** (December 12, 2015) - A landmark international treaty\n2. **IPCC Special Report on 1.5°C** (October 8, 2018) - Critical scientific study\n\nWould you like more details about any of these?",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
    ],
    inputValue: "",
    isLoading: false,
  },
};

// Simulated streaming with progressive message additions
const StreamingChatUI = (args: typeof ChatUI.arguments) => {
  const [isOpen, setIsOpen] = useState(args.isOpen ?? false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const simulateStream = React.useCallback(() => {
    if (isStreaming) return;

    setIsStreaming(true);
    setMessages([]);
    setIsLoading(true);

    // User message
    const userMsg: ChatMessage = {
      id: "user-1",
      role: "user",
      content: "Create an event about Pfizer delaying heart damage study",
      timestamp: new Date().toISOString(),
    };
    setMessages([userMsg]);

    // Simulate tool call after 800ms
    setTimeout(() => {
      const toolMsg: ChatMessage = {
        id: "tool-1",
        role: "tool",
        content: JSON.stringify(
          {
            tool: "createUncategorizedEvent",
            arguments: JSON.stringify({
              title:
                "Pfizer Delays Study of Heart Damage Among Covid-Vaxxed Children Until 2030",
              date: "2024-11-20",
              summary:
                "Pfizer has delayed a major study into the risks of heart damage in children who received the company's Covid mRNA vaccines until 2030.",
            }),
            result: JSON.stringify({
              type: "Uncategorized",
              id: "63e58601-a1b0-4184-97da-0e28f50f738d",
              title:
                "Pfizer Delays Study of Heart Damage Among Covid-Vaxxed Children Until 2030",
              date: "2024-11-20",
              draft: false,
              groups: [{ id: "group-1", name: "Pfizer" }],
              media: [{ id: "media-1", type: "image" }],
              links: [
                { id: "link-1", url: "https://example.com/pfizer-study" },
              ],
              summary:
                "Pfizer has delayed a major study into the risks of heart damage in children who received the company's Covid mRNA vaccines until 2030.",
              created: "2025-11-23T15:21:24.053Z",
              updated: "2025-11-23T15:21:24.053Z",
            }),
          },
          null,
          2,
        ),
        timestamp: new Date().toISOString(),
        tool_call_id: "call-create-event",
      };
      setMessages((prev) => [...prev, toolMsg]);

      // Simulate assistant response after another 500ms
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: "assistant-1",
          role: "assistant",
          content: `I've successfully created an **Uncategorized Event** about the Pfizer study delay:

**Title:** Pfizer Delays Study of Heart Damage Among Covid-Vaxxed Children Until 2030

**Date:** November 20, 2024

**Summary:** Pfizer has delayed a major study into the risks of heart damage in children who received the company's Covid mRNA vaccines until 2030.

The event includes:
- 1 associated group (Pfizer)
- 1 media item
- 1 reference link

Would you like me to add more details or make any modifications to this event?`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
        setIsStreaming(false);
      }, 500);
    }, 800);
  }, [isStreaming]);

  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      simulateStream();
    }
  }, [isOpen, messages.length, simulateStream]);

  const handleSendMessage = () => {
    // Not implemented for this demo
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  };

  return (
    <ChatUI
      {...args}
      isOpen={isOpen}
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      onToggle={() => setIsOpen(!isOpen)}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      onKeyPress={handleKeyPress}
    />
  );
};

export const StreamingSimulation: Story = {
  render: (args) => <StreamingChatUI {...args} />,
  args: {
    isOpen: true,
    welcomeMessage:
      "Watch as messages stream in progressively, simulating a real AI conversation!",
  },
};

// Custom styling
export const CustomTheme: Story = {
  render: (args) => <InteractiveChatUI {...args} />,
  args: {
    isOpen: true,
    messages: [
      {
        id: "1",
        role: "user",
        content: "Hello!",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        role: "assistant",
        content: "Hi there! How can I help you?",
        timestamp: new Date().toISOString(),
      },
    ],
    title: "Custom AI Helper",
    welcomeMessage: "Welcome to the custom themed chat!",
    inputPlaceholder: "Ask me anything...",
    inputValue: "",
    isLoading: false,
  },
};
