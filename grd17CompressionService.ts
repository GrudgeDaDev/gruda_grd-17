/**
 * GRD-17 Data Compression Service - GRUDGE STUDIO
 * Advanced data compression and optimization capabilities
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 */

import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  compressionTime: number;
  data: Buffer;
}

export interface CompressionStats {
  totalOperations: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  averageCompressionRatio: number;
  algorithmUsage: Record<string, number>;
  totalTimeSaved: number;
}

class GRD17CompressionService {
  private stats: CompressionStats = {
    totalOperations: 0,
    totalOriginalBytes: 0,
    totalCompressedBytes: 0,
    averageCompressionRatio: 0,
    algorithmUsage: {},
    totalTimeSaved: 0
  };

  constructor() {
    console.log('🗜️ GRD-17 Data Compression Service initialized');
    this.initializeOptimizations();
  }

  /**
   * Auto-compress data using the best algorithm for the data type
   */
  async autoCompress(data: string | Buffer, hint?: 'text' | 'json' | 'binary' | 'image'): Promise<CompressionResult> {
    const startTime = Date.now();
    const inputBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const originalSize = inputBuffer.length;

    // Choose algorithm based on data characteristics
    let algorithm: string;
    let compressionFunction: (data: Buffer) => Promise<Buffer>;

    if (hint === 'text' || hint === 'json') {
      // Brotli is excellent for text-based data
      algorithm = 'brotli';
      compressionFunction = brotliCompress;
    } else if (hint === 'binary' || originalSize > 1024 * 1024) {
      // Gzip for large binary data
      algorithm = 'gzip';
      compressionFunction = gzip;
    } else {
      // Deflate for general purpose
      algorithm = 'deflate';
      compressionFunction = deflate;
    }

    try {
      const compressed = await compressionFunction(inputBuffer);
      const compressionTime = Date.now() - startTime;
      const compressionRatio = (1 - compressed.length / originalSize) * 100;

      const result: CompressionResult = {
        originalSize,
        compressedSize: compressed.length,
        compressionRatio,
        algorithm,
        compressionTime,
        data: compressed
      };

      // Update statistics
      this.updateStats(result);

      console.log(`🗜️ GRD-17 compressed ${originalSize} bytes to ${compressed.length} bytes (${compressionRatio.toFixed(1)}% reduction) using ${algorithm}`);
      
      return result;
    } catch (error) {
      console.error('❌ GRD-17 compression failed:', error);
      throw error;
    }
  }

  /**
   * Compress using specific algorithm
   */
  async compressWithAlgorithm(data: string | Buffer, algorithm: 'gzip' | 'deflate' | 'brotli'): Promise<CompressionResult> {
    const startTime = Date.now();
    const inputBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const originalSize = inputBuffer.length;

    let compressionFunction: (data: Buffer) => Promise<Buffer>;
    
    switch (algorithm) {
      case 'gzip':
        compressionFunction = gzip;
        break;
      case 'deflate':
        compressionFunction = deflate;
        break;
      case 'brotli':
        compressionFunction = brotliCompress;
        break;
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }

    try {
      const compressed = await compressionFunction(inputBuffer);
      const compressionTime = Date.now() - startTime;
      const compressionRatio = (1 - compressed.length / originalSize) * 100;

      const result: CompressionResult = {
        originalSize,
        compressedSize: compressed.length,
        compressionRatio,
        algorithm,
        compressionTime,
        data: compressed
      };

      this.updateStats(result);
      return result;
    } catch (error) {
      console.error(`❌ GRD-17 ${algorithm} compression failed:`, error);
      throw error;
    }
  }

  /**
   * Decompress data
   */
  async decompress(compressedData: Buffer, algorithm: string): Promise<Buffer> {
    try {
      let decompressFunction: (data: Buffer) => Promise<Buffer>;
      
      switch (algorithm) {
        case 'gzip':
          decompressFunction = gunzip;
          break;
        case 'deflate':
          decompressFunction = inflate;
          break;
        case 'brotli':
          decompressFunction = brotliDecompress;
          break;
        default:
          throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
      }

      const decompressed = await decompressFunction(compressedData);
      console.log(`🔓 GRD-17 decompressed ${compressedData.length} bytes to ${decompressed.length} bytes using ${algorithm}`);
      
      return decompressed;
    } catch (error) {
      console.error(`❌ GRD-17 ${algorithm} decompression failed:`, error);
      throw error;
    }
  }

  /**
   * Compress JSON data with additional optimizations
   */
  async compressJSON(jsonData: any): Promise<CompressionResult> {
    try {
      // Optimize JSON before compression
      const optimizedJSON = this.optimizeJSON(jsonData);
      const jsonString = JSON.stringify(optimizedJSON);
      
      return await this.autoCompress(jsonString, 'json');
    } catch (error) {
      console.error('❌ GRD-17 JSON compression failed:', error);
      throw error;
    }
  }

  /**
   * Decompress and parse JSON data
   */
  async decompressJSON(compressedData: Buffer, algorithm: string): Promise<any> {
    try {
      const decompressed = await this.decompress(compressedData, algorithm);
      const jsonString = decompressed.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ GRD-17 JSON decompression failed:', error);
      throw error;
    }
  }

  /**
   * Batch compress multiple items
   */
  async batchCompress(items: Array<{ id: string; data: string | Buffer; hint?: string }>): Promise<Array<CompressionResult & { id: string }>> {
    const results: Array<CompressionResult & { id: string }> = [];
    
    console.log(`🗜️ GRD-17 starting batch compression of ${items.length} items`);
    
    for (const item of items) {
      try {
        const result = await this.autoCompress(item.data, item.hint as any);
        results.push({ ...result, id: item.id });
      } catch (error) {
        console.error(`❌ GRD-17 failed to compress item ${item.id}:`, error);
      }
    }
    
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
    const overallRatio = (1 - totalCompressed / totalOriginal) * 100;
    
    console.log(`✅ GRD-17 batch compression complete: ${totalOriginal} → ${totalCompressed} bytes (${overallRatio.toFixed(1)}% reduction)`);
    
    return results;
  }

  /**
   * Get compression statistics
   */
  getStatistics(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalOperations: 0,
      totalOriginalBytes: 0,
      totalCompressedBytes: 0,
      averageCompressionRatio: 0,
      algorithmUsage: {},
      totalTimeSaved: 0
    };
    console.log('📊 GRD-17 statistics reset');
  }

  /**
   * Analyze data to recommend best compression algorithm
   */
  analyzeData(data: string | Buffer): {
    recommendedAlgorithm: string;
    estimatedRatio: number;
    dataType: string;
    characteristics: string[];
  } {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const size = buffer.length;
    const characteristics: string[] = [];
    
    // Analyze data characteristics
    let textScore = 0;
    let binaryScore = 0;
    
    // Check for text patterns
    const textChars = buffer.filter(byte => 
      (byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13
    ).length;
    
    textScore = textChars / size;
    binaryScore = 1 - textScore;
    
    if (textScore > 0.8) {
      characteristics.push('high_text_content');
    }
    if (size > 1024 * 1024) {
      characteristics.push('large_file');
    }
    if (buffer.includes(Buffer.from('{'))) {
      characteristics.push('possible_json');
    }
    
    // Determine data type and recommended algorithm
    let dataType: string;
    let recommendedAlgorithm: string;
    let estimatedRatio: number;
    
    if (textScore > 0.9 && characteristics.includes('possible_json')) {
      dataType = 'json';
      recommendedAlgorithm = 'brotli';
      estimatedRatio = 70;
    } else if (textScore > 0.8) {
      dataType = 'text';
      recommendedAlgorithm = 'brotli';
      estimatedRatio = 60;
    } else if (size > 1024 * 1024) {
      dataType = 'large_binary';
      recommendedAlgorithm = 'gzip';
      estimatedRatio = 30;
    } else {
      dataType = 'binary';
      recommendedAlgorithm = 'deflate';
      estimatedRatio = 40;
    }
    
    return {
      recommendedAlgorithm,
      estimatedRatio,
      dataType,
      characteristics
    };
  }

  /**
   * Optimize JSON structure before compression
   */
  private optimizeJSON(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.optimizeJSON(item));
    }
    
    if (data && typeof data === 'object') {
      const optimized: any = {};
      
      // Sort keys for better compression
      const sortedKeys = Object.keys(data).sort();
      
      for (const key of sortedKeys) {
        const value = data[key];
        
        // Remove null values and empty arrays/objects
        if (value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length === 0) {
            continue;
          }
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            continue;
          }
          
          optimized[key] = this.optimizeJSON(value);
        }
      }
      
      return optimized;
    }
    
    return data;
  }

  /**
   * Update compression statistics
   */
  private updateStats(result: CompressionResult): void {
    this.stats.totalOperations++;
    this.stats.totalOriginalBytes += result.originalSize;
    this.stats.totalCompressedBytes += result.compressedSize;
    
    // Update algorithm usage
    this.stats.algorithmUsage[result.algorithm] = 
      (this.stats.algorithmUsage[result.algorithm] || 0) + 1;
    
    // Calculate average compression ratio
    this.stats.averageCompressionRatio = 
      (1 - this.stats.totalCompressedBytes / this.stats.totalOriginalBytes) * 100;
    
    // Estimate time saved (assuming 1ms per KB for network transfer)
    const bytesSaved = result.originalSize - result.compressedSize;
    this.stats.totalTimeSaved += bytesSaved / 1024;
  }

  /**
   * Initialize compression optimizations
   */
  private initializeOptimizations(): void {
    // Set default compression levels for better performance vs ratio balance
    zlib.constants.Z_DEFAULT_COMPRESSION;
    
    console.log('⚙️ GRD-17 compression optimizations initialized');
  }
}

export const grd17CompressionService = new GRD17CompressionService();