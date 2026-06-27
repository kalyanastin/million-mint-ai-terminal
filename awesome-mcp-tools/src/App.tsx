import { useState } from 'react';
import { 
  Search, 
  Github, 
  Terminal, 
  Settings, 
  ExternalLink,
  Code,
  Shield,
  Layers,
  Database
} from 'lucide-react';

interface ToolItem {
  name: string;
  category: 'database' | 'integration' | 'utility' | 'sdk' | 'client';
  description: string;
  npm?: string;
  github: string;
  tags: string[];
}

export default function App() {
  const [filter, setFilter] = useState<'all' | ToolItem['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toolsList: ToolItem[] = [
    // Databases
    {
      name: 'PostgreSQL MCP Server',
      category: 'database',
      description: 'Officially maintained PG database explorer. Allows schemas discovery, reading tables, running raw queries safely, and generating reports.',
      npm: '@modelcontextprotocol/server-postgres',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['sql', 'postgres', 'database']
    },
    {
      name: 'SQLite Explorer',
      category: 'database',
      description: 'Allows reading, writing, and executing structured SQL commands on local SQLite database files.',
      npm: '@modelcontextprotocol/server-sqlite',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['sqlite', 'database', 'sql']
    },
    {
      name: 'Redis Cache Manager',
      category: 'database',
      description: 'Exposes tools to inspect keys, read metadata, set values, and query cache values from active Redis channels.',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['redis', 'cache', 'nosql']
    },
    // Integrations
    {
      name: 'GitHub Server',
      category: 'integration',
      description: 'Integrates with GitHub APIs to search files, open issues, query Pull Requests, write code comments, and view commits.',
      npm: '@modelcontextprotocol/server-github',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['github', 'git', 'api']
    },
    {
      name: 'Slack Notification Bridge',
      category: 'integration',
      description: 'Spawns channels notifications, reads messages, and posts visual blocks to active workspaces.',
      npm: '@modelcontextprotocol/server-slack',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['slack', 'chat', 'api']
    },
    // Utilities
    {
      name: 'Local Filesystem',
      category: 'utility',
      description: 'Grants safe read/write filesystem access to specific directories configured in scopes.',
      npm: '@modelcontextprotocol/server-filesystem',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['files', 'local', 'storage']
    },
    {
      name: 'Puppeteer Browser Agent',
      category: 'utility',
      description: 'Launches headless Chromium instances to take screenshots, scrape dynamically loaded pages, and click visual elements.',
      npm: '@modelcontextprotocol/server-puppeteer',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['puppeteer', 'chrome', 'scrape']
    },
    {
      name: 'Fetch Utilities',
      category: 'utility',
      description: 'Allows performing simple HTTP requests and converts heavy HTML responses directly into clean markdown format for LLMs.',
      npm: '@modelcontextprotocol/server-fetch',
      github: 'https://github.com/modelcontextprotocol/servers',
      tags: ['http', 'fetch', 'api']
    },
    // SDKs
    {
      name: 'TypeScript/Node SDK',
      category: 'sdk',
      description: 'Standard TypeScript library to build custom clients and servers communicating on Stdio or SSE transport channels.',
      npm: '@modelcontextprotocol/sdk',
      github: 'https://github.com/modelcontextprotocol/typescript-sdk',
      tags: ['typescript', 'node', 'javascript']
    },
    {
      name: 'Python MCP SDK',
      category: 'sdk',
      description: 'Officially maintained Python library supporting async transport layers and prompt decorator definitions.',
      npm: 'mcp',
      github: 'https://github.com/modelcontextprotocol/python-sdk',
      tags: ['python', 'asyncio']
    },
    // Clients
    {
      name: 'MCP Studio',
      category: 'client',
      description: 'Visual developer workbench, form client, and JSON-RPC debug timeline interface for local processes.',
      github: 'https://github.com/mcp-studio/mcp-studio',
      tags: ['gui', 'workbench', 'tauri']
    },
    {
      name: 'Claude Desktop client',
      category: 'client',
      description: 'Anthropic official desktop chat client with support for custom local MCP servers loaded in configs.',
      github: 'https://github.com/modelcontextprotocol',
      tags: ['claude', 'desktop']
    }
  ];

  const filteredTools = toolsList.filter(t => {
    const matchesCategory = filter === 'all' || t.category === filter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F8F9FA]">
      
      {/* Visual Header Banner */}
      <header className="relative border-b border-[#2D2F39] bg-[#16161B] overflow-hidden py-16 px-6 sm:px-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF6F43]/10 via-[#0A0A0C]/0 to-[#0A0A0C]/0" />
        <div className="relative max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase bg-[#FF6F43]/15 text-[#FF6F43] font-bold px-3 py-1 rounded-full tracking-wider">Community Catalog</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Awesome MCP Tools</h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            A curated directory of community-built Model Context Protocol (MCP) servers, wrappers, SDK toolkits, and visual interfaces.
          </p>
        </div>
      </header>

      {/* Main Grid Filters & Explorer */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        
        {/* Search & Category Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-6">
          
          {/* Categories select pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Resources', icon: Layers },
              { id: 'database', label: 'Databases', icon: Database },
              { id: 'integration', label: 'APIs & Chats', icon: Code },
              { id: 'utility', label: 'System Utilities', icon: Terminal },
              { id: 'sdk', label: 'Developer SDKs', icon: Settings },
              { id: 'client', label: 'Clients & GUIs', icon: Shield },
            ].map(cat => {
              const Icon = cat.icon;
              const isActive = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#FF6F43] text-white' 
                      : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tools and tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-[#2D2F39] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#FF6F43]"
            />
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 text-sm">
              No MCP resources matched your active filter or search queries.
            </div>
          ) : (
            filteredTools.map((tool, idx) => (
              <div 
                key={idx} 
                className="bg-[#16161B] border border-[#2D2F39] hover:border-slate-700 transition-all rounded-xl p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Category Tag & Redirect links */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase bg-slate-900 text-[#FF6F43] font-bold px-2 py-0.5 rounded border border-slate-800">
                      {tool.category}
                    </span>
                    <div className="flex space-x-2 text-slate-500">
                      <a 
                        href={tool.github} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-slate-300"
                        title="GitHub Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                      {tool.npm && (
                        <a 
                          href={`https://www.npmjs.com/package/${tool.npm}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:text-slate-300 flex items-center"
                          title="NPM Package"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Name and Description */}
                  <div>
                    <h3 className="text-white font-bold text-base mb-1.5">{tool.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-12">{tool.description}</p>
                  </div>
                </div>

                {/* NPM Copy string and Tags */}
                <div className="mt-6 space-y-4 pt-4 border-t border-slate-900">
                  {tool.npm && (
                    <div className="bg-slate-950 p-2 rounded flex items-center justify-between border border-slate-900">
                      <code className="text-[10px] font-mono text-slate-400 select-all truncate">{`npm i ${tool.npm}`}</code>
                    </div>
                  )}

                  {/* Tags list */}
                  <div className="flex flex-wrap gap-1">
                    {tool.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer footer */}
      <footer className="border-t border-[#2D2F39] bg-[#0F0F12] py-8 text-center text-xs text-slate-600">
        <p>© 2026 Awesome MCP Tools. Catalog powered by community contributions. MIT Licensed.</p>
      </footer>
    </div>
  );
}
