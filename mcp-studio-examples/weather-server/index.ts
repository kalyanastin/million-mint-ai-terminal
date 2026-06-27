import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Predefined mock weather data
const MOCK_WEATHER: Record<string, { temp: number; desc: string; humidity: number; wind: string }> = {
  london: { temp: 15, desc: 'Light Rain', humidity: 82, wind: '12 km/h W' },
  'new york': { temp: 24, desc: 'Sunny', humidity: 55, wind: '8 km/h NE' },
  tokyo: { temp: 18, desc: 'Overcast', humidity: 70, wind: '15 km/h S' },
  paris: { temp: 21, desc: 'Partly Cloudy', humidity: 60, wind: '9 km/h NW' },
  sydney: { temp: 12, desc: 'Clear Night', humidity: 45, wind: '18 km/h E' },
};

const server = new Server(
  {
    name: 'weather-provider-server',
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
        name: 'get_current_weather',
        description: 'Get current weather details for a specific city.',
        inputSchema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'The name of the city (e.g., London, Tokyo).',
            },
          },
          required: ['city'],
        },
      },
      {
        name: 'get_weather_forecast',
        description: 'Get a multi-day weather forecast for a city.',
        inputSchema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'The name of the city.',
            },
            days: {
              type: 'integer',
              description: 'Number of forecast days (minimum 1, maximum 5).',
              default: 3,
            },
          },
          required: ['city'],
        },
      },
    ],
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const city = String(args?.city || '').trim().toLowerCase();

  if (!city) {
    throw new Error('City argument is required');
  }

  try {
    switch (name) {
      case 'get_current_weather': {
        const weather = MOCK_WEATHER[city] || {
          temp: 20 + Math.floor(Math.random() * 10) - 5,
          desc: 'Scattered Clouds',
          humidity: 65,
          wind: '10 km/h NW',
        };

        const result = {
          city: city.charAt(0).toUpperCase() + city.slice(1),
          temperature: `${weather.temp}°C`,
          condition: weather.desc,
          humidity: `${weather.humidity}%`,
          wind: weather.wind,
          observationTime: new Date().toLocaleTimeString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_weather_forecast': {
        const days = Math.min(5, Math.max(1, Number(args?.days || 3)));
        const conditions = ['Sunny', 'Rainy', 'Cloudy', 'Clear', 'Windy'];
        const forecastList = [];

        for (let i = 1; i <= days; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);

          forecastList.push({
            date: date.toDateString(),
            tempRange: `${15 + Math.floor(Math.random() * 8)}°C to ${23 + Math.floor(Math.random() * 8)}°C`,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
          });
        }

        const result = {
          city: city.charAt(0).toUpperCase() + city.slice(1),
          days,
          forecast: forecastList,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
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
  console.error('[Weather Server] Running on stdio transport');
}

run().catch((err) => {
  console.error('[Weather Server] Fatal error:', err);
  process.exit(1);
});
