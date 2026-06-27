import { useState } from 'react';

interface JsonInspectorProps {
  data: any;
  expanded?: boolean;
}

export function JsonInspector({ data, expanded = true }: JsonInspectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 overflow-auto max-h-[400px]">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <div className="pt-2">
        <JsonNode value={data} expanded={expanded} isLast={true} />
      </div>
    </div>
  );
}

interface JsonNodeProps {
  label?: string;
  value: any;
  expanded: boolean;
  isLast: boolean;
}

function JsonNode({ label, value, expanded, isLast }: JsonNodeProps) {
  const [isOpen, setIsOpen] = useState(expanded);

  if (value === null) {
    return (
      <div>
        {label && <span className="text-purple-400">{label}: </span>}
        <span className="text-gray-500 font-bold">null</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div>
        {label && <span className="text-purple-400">{label}: </span>}
        <span className="text-amber-500 font-bold">{value ? 'true' : 'false'}</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        {label && <span className="text-purple-400">{label}: </span>}
        <span className="text-cyan-400">{value}</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div>
        {label && <span className="text-purple-400">{label}: </span>}
        <span className="text-emerald-400">"{value}"</span>
        {!isLast && ','}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div>
          {label && <span className="text-purple-400">{label}: </span>}
          <span>[]</span>
          {!isLast && ','}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <span
          className="cursor-pointer select-none text-slate-400 hover:text-slate-200 mr-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▼' : '▶'}
        </span>
        {label && <span className="text-purple-400">{label}: </span>}
        <span>[</span>
        {isOpen ? (
          <div className="pl-4 border-l border-slate-800">
            {value.map((item, idx) => (
              <JsonNode
                key={idx}
                value={item}
                expanded={expanded}
                isLast={idx === value.length - 1}
              />
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-xs"> {value.length} items </span>
        )}
        <span>]</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return (
        <div>
          {label && <span className="text-purple-400">{label}: </span>}
          <span>{"{}"}</span>
          {!isLast && ','}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <span
          className="cursor-pointer select-none text-slate-400 hover:text-slate-200 mr-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▼' : '▶'}
        </span>
        {label && <span className="text-purple-400">{label}: </span>}
        <span>{"{"}</span>
        {isOpen ? (
          <div className="pl-4 border-l border-slate-800">
            {keys.map((key, idx) => (
              <JsonNode
                key={key}
                label={key}
                value={value[key]}
                expanded={expanded}
                isLast={idx === keys.length - 1}
              />
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-xs"> ... </span>
        )}
        <span>{"}"}</span>
        {!isLast && ','}
      </div>
    );
  }

  return null;
}
