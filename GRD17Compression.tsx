/**
 * GRD-17 Compression Component - GRUDGE STUDIO
 * Advanced data compression and optimization interface
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Archive, 
  ArchiveRestore, 
  BarChart3, 
  FileText, 
  Database,
  Zap,
  TrendingDown,
  Clock,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  compressionTime: number;
  data: string;
}

interface CompressionStats {
  totalOperations: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  averageCompressionRatio: number;
  algorithmUsage: Record<string, number>;
  totalTimeSaved: number;
}

interface DataAnalysis {
  recommendedAlgorithm: string;
  estimatedRatio: number;
  dataType: string;
  characteristics: string[];
}

export function GRD17Compression() {
  const [inputData, setInputData] = useState('');
  const [compressedData, setCompressedData] = useState('');
  const [decompressedData, setDecompressedData] = useState('');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'auto' | 'gzip' | 'deflate' | 'brotli'>('auto');
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    fetchStatistics();
    loadSampleData();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/grd17/statistics');
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const loadSampleData = () => {
    const sampleData = JSON.stringify({
      "aiLegion": {
        "models": ["GRD1.7", "GRD2.7", "ALEofThought", "DANGRD", "GRDVIZ"],
        "operations": {
          "coordination": "task_delegation",
          "reasoning": "complex_analysis",
          "chaos_testing": "vulnerability_discovery"
        },
        "performance": {
          "responseTime": "180ms",
          "successRate": "98.5%",
          "operationsPerSecond": 150
        }
      },
      "database": {
        "connection": "postgresql://neondb_owner:***@ep-hidden-math-a6v3ibnz.us-west-2.aws.neon.tech/neondb",
        "tables": ["archived_cards", "ai_legion_logs", "system_alerts", "performance_metrics"],
        "statistics": {
          "totalRecords": 1247,
          "avgQueryTime": "2.1ms",
          "connectionPool": "5/100"
        }
      },
      "containers": {
        "testcontainers": ["redis:7-alpine", "postgres:15-alpine"],
        "status": "operational",
        "performance": {
          "startupTime": "3.2s",
          "memoryUsage": "512MB",
          "networkLatency": "0.5ms"
        }
      }
    }, null, 2);
    
    setInputData(sampleData);
  };

  const analyzeData = async () => {
    if (!inputData.trim()) return;

    try {
      const response = await fetch('/api/grd17/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inputData })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze data:', error);
    }
  };

  const compressData = async () => {
    if (!inputData.trim()) return;

    setIsProcessing(true);
    try {
      const endpoint = selectedAlgorithm === 'auto' ? '/api/grd17/compress' : '/api/grd17/compress';
      const body = selectedAlgorithm === 'auto' 
        ? { data: inputData, hint: 'json' }
        : { data: inputData, algorithm: selectedAlgorithm };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setCompressionResult(data.result);
        setCompressedData(data.result.data);
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to compress data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const decompressData = async () => {
    if (!compressedData || !compressionResult) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/grd17/decompress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: compressedData,
          algorithm: compressionResult.algorithm
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDecompressedData(data.data);
      }
    } catch (error) {
      console.error('Failed to decompress data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const resetStatistics = async () => {
    try {
      const response = await fetch('/api/grd17/reset-statistics', {
        method: 'POST'
      });
      if (response.ok) {
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to reset statistics:', error);
    }
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio >= 70) return 'text-green-400';
    if (ratio >= 50) return 'text-yellow-400';
    if (ratio >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="w-8 h-8 text-white" />
              <div>
                <CardTitle className="text-2xl text-white">GRD-17 Data Compression</CardTitle>
                <p className="text-purple-200">Advanced data compression and optimization capabilities</p>
              </div>
            </div>

            {stats && (
              <div className="text-right">
                <Badge className="bg-purple-600 text-white mb-2">
                  {stats.averageCompressionRatio.toFixed(1)}% avg reduction
                </Badge>
                <div className="text-purple-200 text-sm">
                  {stats.totalOperations} operations
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <Archive className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stats.totalOperations}</div>
              <div className="text-gray-400 text-sm">Total Operations</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stats.averageCompressionRatio.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Avg Compression</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <Database className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{(stats.totalOriginalBytes / 1024).toFixed(1)}KB</div>
              <div className="text-gray-400 text-sm">Data Processed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stats.totalTimeSaved.toFixed(1)}ms</div>
              <div className="text-gray-400 text-sm">Time Saved</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compression Interface */}
      <Tabs defaultValue="compress" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="compress" className="text-white data-[state=active]:bg-purple-600">
            <Archive className="w-4 h-4 mr-2" />
            Compress
          </TabsTrigger>
          <TabsTrigger value="analyze" className="text-white data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-white data-[state=active]:bg-purple-600">
            <TrendingDown className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Input Data</CardTitle>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedAlgorithm}
                      onChange={(e) => setSelectedAlgorithm(e.target.value as any)}
                      className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="auto">Auto Select</option>
                      <option value="gzip">Gzip</option>
                      <option value="deflate">Deflate</option>
                      <option value="brotli">Brotli</option>
                    </select>
                    <Button
                      onClick={loadSampleData}
                      size="sm"
                      variant="outline"
                      className="border-gray-600"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Sample
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Enter data to compress..."
                  className="bg-gray-700 border-gray-600 text-white h-64 font-mono text-sm"
                />
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={compressData}
                    disabled={!inputData.trim() || isProcessing}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Archive className="w-4 h-4 mr-2" />
                    )}
                    Compress
                  </Button>
                  
                  <Button
                    onClick={() => copyToClipboard(inputData, 'input')}
                    size="sm"
                    variant="outline"
                    className="border-gray-600"
                  >
                    {copiedText === 'input' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {inputData && (
                  <div className="text-sm text-gray-400">
                    Size: {new Blob([inputData]).size} bytes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Compression Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {compressionResult && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Original Size</div>
                        <div className="text-lg text-white">{compressionResult.originalSize} bytes</div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Compressed Size</div>
                        <div className="text-lg text-white">{compressionResult.compressedSize} bytes</div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Compression Ratio</div>
                        <div className={`text-lg font-bold ${getCompressionColor(compressionResult.compressionRatio)}`}>
                          {compressionResult.compressionRatio.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Algorithm</div>
                        <div className="text-lg text-white">{compressionResult.algorithm}</div>
                      </div>
                    </div>

                    <Progress 
                      value={compressionResult.compressionRatio} 
                      className="h-3"
                    />

                    <Textarea
                      value={compressedData}
                      readOnly
                      className="bg-gray-700 border-gray-600 text-white h-32 font-mono text-xs"
                      placeholder="Compressed data will appear here..."
                    />

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={decompressData}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                        )}
                        Decompress
                      </Button>
                      
                      <Button
                        onClick={() => copyToClipboard(compressedData, 'compressed')}
                        size="sm"
                        variant="outline"
                        className="border-gray-600"
                      >
                        {copiedText === 'compressed' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    {decompressedData && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Decompressed Data</div>
                        <Textarea
                          value={decompressedData}
                          readOnly
                          className="bg-gray-700 border-gray-600 text-white h-32 font-mono text-xs"
                        />
                      </div>
                    )}
                  </>
                )}

                {!compressionResult && (
                  <div className="text-center text-gray-400 py-8">
                    Enter data and click Compress to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Data Analysis</CardTitle>
                <Button
                  onClick={analyzeData}
                  disabled={!inputData.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded">
                      <div className="text-sm text-gray-400 mb-1">Recommended Algorithm</div>
                      <div className="text-xl text-green-400 font-semibold">{analysis.recommendedAlgorithm}</div>
                    </div>
                    
                    <div className="bg-gray-900 p-4 rounded">
                      <div className="text-sm text-gray-400 mb-1">Estimated Compression</div>
                      <div className="text-xl text-blue-400 font-semibold">{analysis.estimatedRatio}%</div>
                    </div>
                    
                    <div className="bg-gray-900 p-4 rounded">
                      <div className="text-sm text-gray-400 mb-1">Data Type</div>
                      <div className="text-xl text-white">{analysis.dataType}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded">
                    <div className="text-sm text-gray-400 mb-2">Characteristics</div>
                    <div className="space-y-2">
                      {analysis.characteristics.map((char, index) => (
                        <Badge key={index} className="bg-purple-600 mr-2">
                          {char.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Enter data and click Analyze to see recommendations
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {stats && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Compression Statistics</h3>
                <Button
                  onClick={resetStatistics}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Algorithm Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.algorithmUsage).map(([algorithm, count]) => (
                        <div key={algorithm} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{algorithm}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(stats.algorithmUsage))) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-white font-semibold">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Total Data Saved</div>
                        <div className="text-lg text-green-400">
                          {((stats.totalOriginalBytes - stats.totalCompressedBytes) / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Average Processing Time</div>
                        <div className="text-lg text-blue-400">
                          {(stats.totalTimeSaved / stats.totalOperations || 0).toFixed(1)} ms
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 p-3 rounded">
                        <div className="text-sm text-gray-400">Best Compression Achieved</div>
                        <div className="text-lg text-purple-400">
                          {stats.averageCompressionRatio.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}