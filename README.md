# Linear Micro CLI for AI Agents

A lightweight, high-performance Node.js CLI specifically designed for AI agents and developers to interact with [Linear.app](https://linear.app). 

This tool provides a structured, text-based interface optimized for Large Language Models (LLMs) and automated workflows, ensuring clean output and efficient command execution.

## Features

- **Agent-First Design**: Minimalist output optimized for parsing by AI agents.
- **Full CRUD Support**: Manage Tasks (Issues), Projects, and Documents.
- **Unified Search**: Search across all Linear entities with a single command.
- **Status Management**: List workflow states and transition entities by Name or ID.
- **Secure Auth**: Simple token-based authentication with local persistent storage.

## Installation

To install the CLI globally from the current directory:

```bash
npm install -g linear-agent-cli
```

## Authentication

To initialize the CLI with your Linear Personal Access Token:

```bash
linear auth <YOUR_LINEAR_TOKEN>
```

## Usage

### Projects
- `linear project list`
- `linear project create "New Project" <TEAM_ID>`
- `linear project search "Query"`

### Tasks (Issues)
- `linear task list`
- `linear task create "Task Title" <TEAM_ID> --description "Details"`
- `linear task update <TASK_ID> --title "New Title"`

### Documents
- `linear doc list --project <PROJECT_ID>`
- `linear doc create "Design Doc" <PROJECT_ID> --content "Initial content"`
- `linear doc create "Spec" <PROJECT_ID> --create-from-file spec.md`

### Search & Status
- `linear search "Search term"`
- `linear status list`
- `linear status set <ID> "Done"`

## Technical Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **API Client**: @linear/sdk
- **Testing**: Vitest (100% Coverage)