import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// In-memory todo list
const todos: Todo[] = [
  { id: 1, title: 'Explore MCP Studio', completed: true },
  { id: 2, title: 'Build a custom MCP server', completed: false },
];

let nextId = 3;

const server = new Server(
  {
    name: 'todo-manager-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_todos',
        description: 'Retrieve the current list of all todo items.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add_todo',
        description: 'Add a new todo task to the checklist.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title description of the todo task.',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'complete_todo',
        description: 'Mark a todo item as completed by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The numeric ID of the todo task.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_todo',
        description: 'Permanently remove a todo item by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The numeric ID of the todo task to delete.',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_todos': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todos, null, 2),
            },
          ],
        };
      }

      case 'add_todo': {
        const title = String(args?.title);
        if (!title) {
          throw new Error('Title parameter is required');
        }

        const newTodo: Todo = {
          id: nextId++,
          title,
          completed: false,
        };
        todos.push(newTodo);

        return {
          content: [
            {
              type: 'text',
              text: `Success! Added todo #${newTodo.id}: "${newTodo.title}"`,
            },
          ],
        };
      }

      case 'complete_todo': {
        const id = Number(args?.id);
        const todo = todos.find((t) => t.id === id);
        if (!todo) {
          throw new Error(`Todo with ID ${id} not found`);
        }

        todo.completed = true;
        return {
          content: [
            {
              type: 'text',
              text: `Success! Marked todo #${id} as completed.`,
            },
          ],
        };
      }

      case 'delete_todo': {
        const id = Number(args?.id);
        const idx = todos.findIndex((t) => t.id === id);
        if (idx === -1) {
          throw new Error(`Todo with ID ${id} not found`);
        }

        todos.splice(idx, 1);
        return {
          content: [
            {
              type: 'text',
              text: `Success! Deleted todo #${id}.`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: err.message || err.toString(),
        },
      ],
    };
  }
});

// Run the server on standard streams transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Todo Server] Running on stdio transport');
}

run().catch((err) => {
  console.error('[Todo Server] Fatal error:', err);
  process.exit(1);
});
