import React, { useState, useRef, useEffect } from 'react';
import { ConsoleEntry } from '../types';
import { sendCommand } from '../utils/deviceAPI';
import { formatTimestamp } from '../utils/formatters';

interface CommandConsoleProps {
  onUpdate: () => void;
}

const CommandConsole: React.FC<CommandConsoleProps> = ({ onUpdate }) => {
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    {
      timestamp: new Date(),
      type: 'response',
      content: 'RGB Lighting OS Console v1.0 - Ready',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const addEntry = (type: ConsoleEntry['type'], content: string) => {
    setEntries((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        type,
        content,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    addEntry('command', command);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await sendCommand(command);
      addEntry('response', response.message);
      onUpdate();
    } catch (error) {
      addEntry('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConsole = () => {
    setEntries([
      {
        timestamp: new Date(),
        type: 'response',
        content: 'Console cleared',
      },
    ]);
  };

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-danger"></div>
          <div className="w-3 h-3 rounded-full bg-accent-warning"></div>
          <div className="w-3 h-3 rounded-full bg-accent-success"></div>
          <span className="ml-2 text-sm text-gray-400 font-mono">Command Console</span>
        </div>
        <button
          onClick={clearConsole}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Console Output */}
      <div className="h-96 overflow-y-auto p-4 bg-dark-bg font-mono text-sm">
        {entries.map((entry, index) => (
          <div key={index} className="mb-2">
            <span className="text-gray-500 text-xs">
              [{formatTimestamp(entry.timestamp)}]{' '}
            </span>
            {entry.type === 'command' && (
              <span className="text-accent-primary">$ {entry.content}</span>
            )}
            {entry.type === 'response' && (
              <span className="text-accent-success">{entry.content}</span>
            )}
            {entry.type === 'error' && (
              <span className="text-accent-danger">{entry.content}</span>
            )}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>

      {/* Console Input */}
      <form onSubmit={handleSubmit} className="border-t border-dark-border bg-dark-bg p-4">
        <div className="flex items-center gap-2">
          <span className="text-accent-primary font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            disabled={isProcessing}
            className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandConsole;
