import React, { useState, useEffect } from 'react';

interface SchemaFormProps {
  schema: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function SchemaForm({ schema, onSubmit, submitLabel = 'Run Tool', isLoading = false }: SchemaFormProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const properties = schema?.properties || {};
  const required = schema?.required || [];

  // Reset values when schema changes
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    Object.keys(properties).forEach((key) => {
      const prop = properties[key];
      if (prop.default !== undefined) {
        initialValues[key] = prop.default;
      } else if (prop.type === 'boolean') {
        initialValues[key] = false;
      } else {
        initialValues[key] = '';
      }
    });
    setValues(initialValues);
    setErrors({});
  }, [schema]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate required fields
    required.forEach((key) => {
      if (values[key] === undefined || values[key] === '') {
        newErrors[key] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert values to correct types before submitting
    const parsedValues: Record<string, any> = {};
    Object.keys(properties).forEach((key) => {
      const prop = properties[key];
      const rawVal = values[key];

      if (rawVal === undefined || rawVal === '') {
        return;
      }

      if (prop.type === 'number' || prop.type === 'integer') {
        parsedValues[key] = Number(rawVal);
      } else if (prop.type === 'boolean') {
        parsedValues[key] = Boolean(rawVal);
      } else if (prop.type === 'object' || prop.type === 'array') {
        try {
          parsedValues[key] = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        } catch {
          newErrors[key] = 'Invalid JSON object/array';
        }
      } else {
        parsedValues[key] = rawVal;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(parsedValues);
  };

  if (Object.keys(properties).length === 0) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-slate-400 text-sm">This tool does not require any parameters.</p>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
        >
          {isLoading ? 'Running...' : submitLabel}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
      {Object.keys(properties).map((key) => {
        const prop = properties[key];
        const isRequired = required.includes(key);
        const error = errors[key];

        return (
          <div key={key} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {key}
              {isRequired && <span className="text-orange-500 ml-1">*</span>}
              {prop.description && (
                <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                  {prop.description}
                </span>
              )}
            </label>

            {prop.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`field-${key}`}
                  checked={!!values[key]}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-400">Enabled</span>
              </div>
            ) : prop.type === 'object' || prop.type === 'array' ? (
              <textarea
                id={`field-${key}`}
                rows={3}
                value={values[key] || ''}
                placeholder={prop.type === 'object' ? '{\n  "key": "value"\n}' : '[\n  "item"\n]'}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full font-mono text-xs rounded border border-slate-800 bg-slate-900 text-slate-200 p-2 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <input
                id={`field-${key}`}
                type={prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text'}
                value={values[key] || ''}
                placeholder={prop.default !== undefined ? String(prop.default) : ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 text-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
            )}

            {error && <span className="text-[11px] text-red-400 block font-medium">{error}</span>}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-medium py-2.5 px-4 rounded transition-colors text-sm"
      >
        {isLoading ? 'Running...' : submitLabel}
      </button>
    </form>
  );
}
