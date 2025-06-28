/**
 * Real Wallet Manager - GRUDGE STUDIO Solana Wallet Interface
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 * All wallet systems are products of GRUDGE STUDIO
 * 
 * Real Solana blockchain integration - no simulated functionality
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Copy, 
  Send, 
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  Coins,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WalletData {
  publicKey: string;
  secretKey: number[];
}

interface WalletInfo {
  publicKey: string;
  balance: number;
  tokens: TokenInfo[];
  transactions: TransactionInfo[];
}

interface TokenInfo {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
}

interface TransactionInfo {
  signature: string;
  blockTime: number;
  amount: number;
  type: 'send' | 'receive' | 'mint';
  status: 'confirmed' | 'finalized' | 'pending';
}

export function RealWalletManager() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [networkStats, setNetworkStats] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Load wallet from localStorage if exists
    const storedWallet = localStorage.getItem('grudge_studio_wallet');
    if (storedWallet) {
      try {
        const walletData = JSON.parse(storedWallet);
        setWallet(walletData);
        loadWalletInfo(walletData.publicKey);
      } catch (error) {
        console.error('Failed to load stored wallet:', error);
      }
    }

    // Load network stats
    loadNetworkStats();
  }, []);

  const loadNetworkStats = async () => {
    try {
      const stats = await apiRequest('/api/blockchain/stats');
      setNetworkStats(stats);
    } catch (error) {
      console.error('Failed to load network stats:', error);
    }
  };

  const loadWalletInfo = async (publicKey: string) => {
    try {
      setIsLoading(true);
      const info = await apiRequest('/api/blockchain/wallet-info', 'POST', { publicKey });
      setWalletInfo(info);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load wallet info",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewWallet = async () => {
    try {
      setIsLoading(true);
      const newWallet = await apiRequest('/api/blockchain/create-wallet', 'POST');
      
      setWallet(newWallet);
      localStorage.setItem('grudge_studio_wallet', JSON.stringify(newWallet));
      
      toast({
        title: "Wallet Created",
        description: "New Solana wallet created successfully. Save your secret key securely!",
      });

      // Load wallet info
      await loadWalletInfo(newWallet.publicKey);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestAirdrop = async () => {
    if (!wallet) return;

    try {
      setIsLoading(true);
      const result = await apiRequest('/api/blockchain/airdrop', 'POST', {
        publicKey: wallet.publicKey,
        amount: 1
      });

      toast({
        title: "Airdrop Requested",
        description: `1 SOL airdrop initiated. Signature: ${result.signature}`,
      });

      // Refresh wallet info
      setTimeout(() => loadWalletInfo(wallet.publicKey), 3000);
    } catch (error: any) {
      toast({
        title: "Airdrop Failed",
        description: error.message || "Airdrop not available on mainnet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mintGBUX = async () => {
    if (!wallet) return;

    try {
      setIsLoading(true);
      const result = await apiRequest('/api/blockchain/mint-gbux', 'POST', {
        recipientPublicKey: wallet.publicKey,
        amount: 1000
      });

      toast({
        title: "GBUX Minted",
        description: `1000 GBUX tokens minted. Signature: ${result.signature}`,
      });

      // Refresh wallet info
      setTimeout(() => loadWalletInfo(wallet.publicKey), 3000);
    } catch (error: any) {
      toast({
        title: "Mint Failed",
        description: error.message || "Failed to mint GBUX tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transferSOL = async () => {
    if (!wallet || !transferTo || !transferAmount) return;

    try {
      setIsLoading(true);
      const result = await apiRequest('/api/blockchain/transfer', 'POST', {
        fromSecretKey: wallet.secretKey,
        toPublicKey: transferTo,
        amount: parseFloat(transferAmount)
      });

      toast({
        title: "Transfer Sent",
        description: `${transferAmount} SOL sent. Signature: ${result.signature}`,
      });

      // Clear form and refresh wallet info
      setTransferAmount('');
      setTransferTo('');
      setTimeout(() => loadWalletInfo(wallet.publicKey), 3000);
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Transfer failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const exportWallet = () => {
    if (!wallet) return;

    const walletData = {
      publicKey: wallet.publicKey,
      secretKey: wallet.secretKey,
      exportedAt: new Date().toISOString(),
      network: networkStats?.network || 'unknown'
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grudge-studio-wallet-${wallet.publicKey.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Wallet Exported",
      description: "Wallet file downloaded. Keep it secure!",
    });
  };

  return (
    <div className="space-y-6">
      {/* GRUDGE STUDIO Header */}
      <Card className="bg-gradient-to-r from-green-900 to-blue-900 border-green-700">
        <CardHeader>
          <CardTitle className="text-white text-center">
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="w-6 h-6" />
              <span>GRUDGE STUDIO Real Blockchain Wallet</span>
            </div>
            <p className="text-sm text-green-200 mt-2">Created by RacAlvin The Pirate King</p>
            <p className="text-xs text-green-300">Real Solana blockchain - no simulation</p>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Network Status */}
      {networkStats && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Network Status</span>
              <Badge variant="default" className="bg-green-600">REAL</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Network: </span>
                <span className="text-white font-medium">{networkStats.network}</span>
              </div>
              <div>
                <span className="text-gray-400">Current Slot: </span>
                <span className="text-white font-medium">{networkStats.currentSlot}</span>
              </div>
              <div>
                <span className="text-gray-400">Epoch: </span>
                <span className="text-white font-medium">{networkStats.epoch}</span>
              </div>
              <div>
                <span className="text-gray-400">GBUX Mint: </span>
                <span className="text-green-400 font-medium">
                  {networkStats.gbuxMint ? `${networkStats.gbuxMint.slice(0, 8)}...` : 'Not available'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Creation/Management */}
      {!wallet ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create Real Solana Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Create a new Solana wallet to interact with the real blockchain. This will generate a real keypair for actual transactions.
            </p>
            <Button 
              onClick={createNewWallet} 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating...' : 'Create New Wallet'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="send" className="text-white">Send</TabsTrigger>
            <TabsTrigger value="receive" className="text-white">Receive</TabsTrigger>
            <TabsTrigger value="security" className="text-white">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Wallet Balance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Wallet Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {walletInfo ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {walletInfo.balance.toFixed(4)} SOL
                      </div>
                      <p className="text-gray-400">≈ ${(walletInfo.balance * 20).toFixed(2)} USD</p>
                    </div>

                    {/* Tokens */}
                    {walletInfo.tokens.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Token Holdings</h4>
                        <div className="space-y-2">
                          {walletInfo.tokens.map((token, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                              <span className="text-white">{token.symbol}</span>
                              <span className="text-green-400">{token.balance.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={requestAirdrop} 
                        disabled={isLoading}
                        variant="outline"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      >
                        Request Airdrop
                      </Button>
                      <Button 
                        onClick={mintGBUX} 
                        disabled={isLoading}
                        variant="outline"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                      >
                        Mint GBUX
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={() => loadWalletInfo(wallet.publicKey)} disabled={isLoading}>
                      {isLoading ? 'Loading...' : 'Load Wallet Info'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            {walletInfo?.transactions && walletInfo.transactions.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {walletInfo.transactions.slice(0, 5).map((tx, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div>
                          <span className={`text-${tx.type === 'send' ? 'red' : 'green'}-400`}>
                            {tx.type === 'send' ? '↗' : '↙'} {tx.type}
                          </span>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.blockTime * 1000).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-white">{(tx.amount / 1000000000).toFixed(4)} SOL</span>
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary" className="text-xs">{tx.status}</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard(tx.signature, 'Transaction signature')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Send SOL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Recipient Address</label>
                  <Input
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="Enter Solana public key"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Amount (SOL)</label>
                  <Input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.1"
                    step="0.001"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  onClick={transferSOL}
                  disabled={isLoading || !transferTo || !transferAmount}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Sending...' : 'Send SOL'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Receive Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Your Public Key</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={wallet.publicKey}
                      readOnly
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button 
                      size="sm"
                      onClick={() => copyToClipboard(wallet.publicKey, 'Public key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Share this public key to receive SOL or SPL tokens. This is your wallet address on the Solana blockchain.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Wallet Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Secret Key (Keep Secure!)</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showSecretKey ? "text" : "password"}
                      value={showSecretKey ? JSON.stringify(wallet.secretKey) : "•".repeat(50)}
                      readOnly
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button 
                      size="sm"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => copyToClipboard(JSON.stringify(wallet.secretKey), 'Secret key')}
                    variant="outline"
                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Secret
                  </Button>
                  <Button 
                    onClick={exportWallet}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Wallet
                  </Button>
                </div>

                <div className="p-3 bg-red-900 border border-red-700 rounded">
                  <h4 className="text-red-300 font-medium">⚠️ Security Warning</h4>
                  <p className="text-red-200 text-sm mt-1">
                    Never share your secret key with anyone. Anyone with access to your secret key can control your wallet and steal your funds.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}