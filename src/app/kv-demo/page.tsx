'use client';

import { useState } from 'react';

export default function KVDemo() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    if (!key) return;
    
    setLoading(true);
    setResult(''); // 清空之前的结果
    try {
      const response = await fetch(`/api/kv?key=${encodeURIComponent(key)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('GET Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePut = async () => {
    if (!key || !value) return;
    
    setLoading(true);
    setResult(''); // 清空之前的结果
    try {
      const response = await fetch('/api/kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('PUT Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!key) return;
    
    setLoading(true);
    setResult(''); // 清空之前的结果
    try {
      const response = await fetch(`/api/kv?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('DELETE Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🗄️ KV存储演示</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Key:</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="输入键名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Value:</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg h-24"
              placeholder="输入值（将被JSON序列化存储）"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleGet}
            disabled={!key || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            GET
          </button>
          
          <button
            onClick={handlePut}
            disabled={!key || !value || loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            PUT
          </button>
          
          <button
            onClick={handleDelete}
            disabled={!key || loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            DELETE
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">处理中...</p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">结果:</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm border">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}