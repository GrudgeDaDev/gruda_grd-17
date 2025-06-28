/**
 * Blockchain Statistics Component
 * Real-time GRUDA blockchain monitoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Blocks, Zap, TrendingUp, Shield, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockchainStats {
  totalBlocks: number;
  totalTransactions: number;
  pendingTransactions: number;
  difficulty: number;
  isValid: boolean;
}

interface NFTMintRequest {
  toAddress: string;
  tokenId: string;
  metadata: {
    name: string;
    description: string;
  };
}

export function BlockchainStats() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [nftRequest, setNftRequest] = useState<NFTMintRequest>({
    toAddress: "",
    tokenId: "",
    metadata: { name: "", description: "" },
  });
  const [isMinting, setIsMinting] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/blockchain/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch blockchain stats:", error);
    }
  };

  const mintNFT = async () => {
    if (
      !nftRequest.toAddress ||
      !nftRequest.tokenId ||
      !nftRequest.metadata.name
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all NFT details",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    try {
      const response = await fetch("/api/blockchain/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nftRequest),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "NFT Minted",
          description: `Transaction: ${data.transactionHash.substring(0, 12)}...`,
        });

        // Reset form
        setNftRequest({
          toAddress: "",
          tokenId: "",
          metadata: { name: "", description: "" },
        });

        // Refresh stats
        fetchStats();
      } else {
        const error = await response.json();
        toast({
          title: "Minting Failed",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error during NFT minting",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            Loading blockchain statistics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Statistics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Blocks className="h-5 w-5" />
            GRUDA Blockchain Statistics
            <Badge
              variant="outline"
              className={
                stats.isValid
                  ? "text-green-400 border-green-400"
                  : "text-red-400 border-red-400"
              }
            >
              {stats.isValid ? "VALID" : "INVALID"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Blocks className="h-8 w-8 text-blue-400" />
              </div>
              <Label className="text-gray-300">Total Blocks</Label>
              <p className="text-2xl font-bold text-white">
                {stats.totalBlocks}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <Label className="text-gray-300">Transactions</Label>
              <p className="text-2xl font-bold text-white">
                {stats.totalTransactions}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <Label className="text-gray-300">Pending</Label>
              <p className="text-2xl font-bold text-white">
                {stats.pendingTransactions}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <Label className="text-gray-300">Difficulty</Label>
              <p className="text-2xl font-bold text-white">
                {stats.difficulty}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Minting */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Coins className="h-5 w-5" />
            Mint NFT on GRUDA Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Recipient Address</Label>
              <Input
                placeholder="GRUDA address..."
                value={nftRequest.toAddress}
                onChange={(e) =>
                  setNftRequest((prev) => ({
                    ...prev,
                    toAddress: e.target.value,
                  }))
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Token ID</Label>
              <Input
                placeholder="unique-token-id"
                value={nftRequest.tokenId}
                onChange={(e) =>
                  setNftRequest((prev) => ({
                    ...prev,
                    tokenId: e.target.value,
                  }))
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">NFT Name</Label>
              <Input
                placeholder="My GRUDA NFT"
                value={nftRequest.metadata.name}
                onChange={(e) =>
                  setNftRequest((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, name: e.target.value },
                  }))
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Input
                placeholder="A unique GRUDA NFT"
                value={nftRequest.metadata.description}
                onChange={(e) =>
                  setNftRequest((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value },
                  }))
                }
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <Button
            onClick={mintNFT}
            disabled={isMinting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isMinting ? "Minting..." : "Mint NFT"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
