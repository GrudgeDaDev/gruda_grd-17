/**
 * Blockchain Manager - GRUDA Chain operations and monitoring
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Blocks,
  Coins,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Shield,
  Network,
} from "lucide-react";
import { ContextualHelpBubble } from "@/components/help/ContextualHelpBubble";

interface BlockchainStats {
  currentBlock: number;
  totalTransactions: number;
  activeValidators: number;
  networkHashRate: string;
  grudaPrice: number;
  priceChange24h: number;
  stakingRewards: number;
  networkHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export function BlockchainManager() {
  const [stats, setStats] = useState<BlockchainStats>({
    currentBlock: 1247892,
    totalTransactions: 89654321,
    activeValidators: 147,
    networkHashRate: "2.3 TH/s",
    grudaPrice: 0.89,
    priceChange24h: 12.4,
    stakingRewards: 8.7,
    networkHealth: 'excellent'
  });

  const [recentBlocks, setRecentBlocks] = useState([
    { height: 1247892, hash: "0x7f9a2b...", transactions: 156, timestamp: new Date(Date.now() - 30000) },
    { height: 1247891, hash: "0x8b3c4d...", transactions: 203, timestamp: new Date(Date.now() - 90000) },
    { height: 1247890, hash: "0x9d5e6f...", transactions: 178, timestamp: new Date(Date.now() - 150000) },
  ]);

  useEffect(() => {
    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        currentBlock: prev.currentBlock + Math.floor(Math.random() * 3),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 50),
        grudaPrice: prev.grudaPrice + (Math.random() - 0.5) * 0.01,
        priceChange24h: prev.priceChange24h + (Math.random() - 0.5) * 0.5,
      }));

      // Update recent blocks occasionally
      if (Math.random() < 0.3) {
        setRecentBlocks(prev => {
          const newBlock = {
            height: prev[0].height + 1,
            hash: `0x${Math.random().toString(16).substr(2, 6)}...`,
            transactions: Math.floor(Math.random() * 200) + 100,
            timestamp: new Date()
          };
          return [newBlock, ...prev.slice(0, 2)];
        });
      }
    };

    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Blocks className="w-6 h-6 mr-2 text-purple-400" />
          GRUDA Blockchain Manager
          <div className="ml-3">
            <ContextualHelpBubble 
              contextId="blockchain-manager" 
              position="bottom"
              autoShow={true}
              delay={2000}
            />
          </div>
        </h2>
        <Badge className={
          stats.networkHealth === 'excellent' ? 'bg-green-600' :
          stats.networkHealth === 'good' ? 'bg-blue-600' :
          stats.networkHealth === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
        }>
          Network {stats.networkHealth}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Blocks className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Current Block</p>
                <p className="text-2xl font-bold text-white">{stats.currentBlock.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Coins className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">GRUDA Price</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">${stats.grudaPrice.toFixed(3)}</p>
                  <Badge className={stats.priceChange24h >= 0 ? 'bg-green-600' : 'bg-red-600'}>
                    {stats.priceChange24h >= 0 ? '+' : ''}{stats.priceChange24h.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Validators</p>
                <p className="text-2xl font-bold text-white">{stats.activeValidators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Hash Rate</p>
                <p className="text-2xl font-bold text-white">{stats.networkHashRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Blocks and Network Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBlocks.map((block) => (
                <div key={block.height} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Block #{block.height}</div>
                    <div className="text-xs text-gray-400">{block.hash}</div>
                    <div className="text-xs text-gray-500">{block.timestamp.toLocaleTimeString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-medium">{block.transactions} txs</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Network Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-white">{stats.totalTransactions.toLocaleString()}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Staking Rewards APY</span>
                  <span className="text-green-400">{stats.stakingRewards}%</span>
                </div>
                <Progress value={stats.stakingRewards * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Network Decentralization</span>
                  <span className="text-blue-400">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Blockchain Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Network className="w-4 h-4 mr-2" />
              Node Status
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Coins className="w-4 h-4 mr-2" />
              Token Bridge
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Users className="w-4 h-4 mr-2" />
              Validator Panel
            </Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Activity className="w-4 h-4 mr-2" />
              Transaction Pool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
