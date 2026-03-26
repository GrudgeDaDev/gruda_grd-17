/**
 * GRD-17 AI Automation Controller - GRUDGE STUDIO
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 * Complete automation control interface for all API conditions
 *
 * Backend: https://api.grudge-studio.com (Grudge Studio VPS)
 * Storage: Puter.js free cloud storage, linked to Grudge ID
 */
import React, { useState, useEffect, useCallback } from 'react';
import { grd17Puter, type GrudgeUser, type GRD17AutomationConfig } from './puter-integration';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot,
  Activity,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Code,
  Database,
  Network,
  Shield,
  TrendingUp,
  Eye,
  Plus,
  TestTube,
  Crown,
  User,
  LogIn,
  LogOut,
  Save,
  Cloud
} from 'lucide-react';

// Grudge Legion proxy base — all GRD-17 calls route through here
const GRD17_BASE = '/api/gruda-legion/grd17';

interface AutomationCondition {
  endpoint: string;
  method: string;
  condition: string;
  triggerType: string;
  frequency?: number;
  enabled: boolean;
  successCount: number;
  errorCount: number;
  lastExecuted?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  aiModel: string;
  conditionsCount: number;
  conditions: AutomationCondition[];
}

interface AutomationStatus {
  totalRules: number;
  enabledRules: number;
  activeMonitors: number;
  queueLength: number;
  rules: AutomationRule[];
}

export function GRD17AutomationController() {
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEndpoint, setTestEndpoint] = useState('');
  const [testCondition, setTestCondition] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [puterUser, setPuterUser] = useState<GrudgeUser | null>(null);
  const [puterLoading, setPuterLoading] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);
  const [newRule, setNewRule] = useState({
    id: '',
    name: '',
    description: '',
    aiModel: 'grd17',
    priority: 2
  });

  // Auto-init Puter on mount if already signed in
  useEffect(() => {
    if (grd17Puter.isSignedIn()) {
      grd17Puter.signIn().then(user => {
        if (user) {
          setPuterUser(user);
          // Load cloud-saved automation config and restore rule preferences
          grd17Puter.loadAutomationConfig().then(config => {
            if (config) console.log('GRD-17: Restored automation config from Puter cloud');
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    fetchAutomationStatus();
    const interval = setInterval(fetchAutomationStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePuterSignIn = useCallback(async () => {
    setPuterLoading(true);
    const user = await grd17Puter.signIn();
    setPuterUser(user);
    if (user && automationStatus) {
      // Restore saved preferences from cloud
      const config = await grd17Puter.loadAutomationConfig();
      if (config) console.log('GRD-17: Loaded cloud config for', user.username);
    }
    setPuterLoading(false);
  }, [automationStatus]);

  const handlePuterSignOut = useCallback(async () => {
    await grd17Puter.signOut();
    setPuterUser(null);
  }, []);

  const saveToCloud = useCallback(async () => {
    if (!puterUser || !automationStatus) return;
    const config: GRD17AutomationConfig = {
      enabledRules: automationStatus.rules.filter(r => r.enabled).map(r => r.id),
      disabledRules: automationStatus.rules.filter(r => !r.enabled).map(r => r.id),
      customRules: [],
      preferredModel: newRule.aiModel,
      lastUpdated: new Date().toISOString(),
    };
    await grd17Puter.saveAutomationConfig(config);
    await grd17Puter.markSynced();
    setCloudSaved(true);
    setTimeout(() => setCloudSaved(false), 2000);
  }, [puterUser, automationStatus, newRule.aiModel]);

  const fetchAutomationStatus = async () => {
    try {
      const response = await fetch(`${GRD17_BASE}/automation/status`);
      if (response.ok) {
        const data = await response.json();
        setAutomationStatus(data.automation);
      }
    } catch (error) {
      console.error('Failed to fetch automation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const endpoint = enabled ? 'enable' : 'disable';
      const response = await fetch(`${GRD17_BASE}/automation/${endpoint}/${ruleId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchAutomationStatus();
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const executeRule = async (ruleId: string) => {
    try {
      const response = await fetch(`${GRD17_BASE}/automation/execute/${ruleId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchAutomationStatus();
      }
    } catch (error) {
      console.error('Failed to execute rule:', error);
    }
  };

  const testConditionFunc = async () => {
    if (!testEndpoint || !testCondition) return;
    
    try {
      const response = await fetch(`${GRD17_BASE}/automation/test-condition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: testEndpoint,
          condition: testCondition
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(data.conditionMet);
      }
    } catch (error) {
      console.error('Failed to test condition:', error);
      setTestResult(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-400 bg-red-900';
      case 2: return 'text-yellow-400 bg-yellow-900';
      case 3: return 'text-blue-400 bg-blue-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getAIModelIcon = (model: string) => {
    switch (model) {
      case 'grd17': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'aleboss': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'grd27': return <Shield className="w-4 h-4 text-green-400" />;
      case 'aleofthought': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'dangrd': return <Zap className="w-4 h-4 text-red-400" />;
      case 'grdviz': return <TrendingUp className="w-4 h-4 text-orange-400" />;
      default: return <Bot className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mr-2" />
            <span className="text-white">Loading GRD-17 Automation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-white" />
              <div>
                <CardTitle className="text-2xl text-white">GRD-17 AI Automation</CardTitle>
                <p className="text-blue-200">Complete API integration conditions for AI automation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600 text-white">
                {automationStatus?.enabledRules} / {automationStatus?.totalRules} Active
              </Badge>

              {/* Puter / Grudge account panel */}
              {puterUser ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-700 text-white flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {puterUser.username}
                  </Badge>
                  <Button
                    onClick={saveToCloud}
                    variant="outline"
                    size="sm"
                    title="Save automation config to Puter cloud"
                  >
                    {cloudSaved
                      ? <><Cloud className="w-4 h-4 mr-1 text-green-400" /> Saved!</>
                      : <><Save className="w-4 h-4 mr-1" /> Save Cloud</>
                    }
                  </Button>
                  <Button onClick={handlePuterSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-1" /> Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handlePuterSignIn}
                  disabled={puterLoading}
                  size="sm"
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {puterLoading ? 'Connecting...' : 'Sign in with Grudge'}
                </Button>
              )}

              <Button onClick={fetchAutomationStatus} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Rules</p>
                <p className="text-2xl font-bold text-white">{automationStatus?.totalRules || 0}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Monitors</p>
                <p className="text-2xl font-bold text-white">{automationStatus?.activeMonitors || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Queue Length</p>
                <p className="text-2xl font-bold text-white">{automationStatus?.queueLength || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Enabled Rules</p>
                <p className="text-2xl font-bold text-white">{automationStatus?.enabledRules || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="rules" className="text-white data-[state=active]:bg-blue-600">
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="conditions" className="text-white data-[state=active]:bg-blue-600">
            API Conditions
          </TabsTrigger>
          <TabsTrigger value="test" className="text-white data-[state=active]:bg-blue-600">
            Condition Tester
          </TabsTrigger>
          <TabsTrigger value="create" className="text-white data-[state=active]:bg-blue-600">
            Create Rule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {automationStatus?.rules.map((rule, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getAIModelIcon(rule.aiModel)}
                      <div>
                        <h4 className="font-semibold text-white">{rule.name}</h4>
                        <p className="text-sm text-gray-400">AI Model: {rule.aiModel.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getPriorityColor(rule.priority)} px-2 py-1`}>
                        Priority {rule.priority}
                      </Badge>
                      
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                      
                      <Button
                        onClick={() => executeRule(rule.id)}
                        variant="outline"
                        size="sm"
                        disabled={!rule.enabled}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Execute
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-900 p-3 rounded">
                      <div className="text-gray-400 mb-1">Conditions</div>
                      <div className="text-white font-semibold">{rule.conditionsCount}</div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded">
                      <div className="text-gray-400 mb-1">Success Rate</div>
                      <div className="text-green-400 font-semibold">
                        {rule.conditions.length > 0 
                          ? Math.round((rule.conditions.reduce((sum, c) => sum + c.successCount, 0) / 
                              Math.max(1, rule.conditions.reduce((sum, c) => sum + c.successCount + c.errorCount, 0))) * 100)
                          : 0}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded">
                      <div className="text-gray-400 mb-1">Status</div>
                      <div className={`font-semibold ${rule.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <div className="space-y-4">
            {automationStatus?.rules.map((rule) => (
              <Card key={rule.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    {getAIModelIcon(rule.aiModel)}
                    <span className="ml-2">{rule.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rule.conditions.map((condition, condIndex) => (
                      <div key={condIndex} className="bg-gray-900 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {condition.method}
                            </Badge>
                            <code className="text-blue-400 text-sm">{condition.endpoint}</code>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {condition.enabled ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-xs text-gray-400">
                              {condition.frequency ? `${condition.frequency / 1000}s` : 'Manual'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="text-gray-400">Condition:</span> {condition.condition}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Success: {condition.successCount} | Errors: {condition.errorCount}</span>
                          {condition.lastExecuted && (
                            <span>Last: {new Date(condition.lastExecuted).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-blue-400" />
                API Condition Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Endpoint
                </label>
                <Input
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  placeholder="/api/ai/status"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition
                </label>
                <Input
                  value={testCondition}
                  onChange={(e) => setTestCondition(e.target.value)}
                  placeholder="status.healthy < 8"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={testConditionFunc}
                  disabled={!testEndpoint || !testCondition}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Condition
                </Button>
                
                {testResult !== null && (
                  <div className="flex items-center space-x-2">
                    {testResult ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-medium ${testResult ? 'text-green-400' : 'text-red-400'}`}>
                      {testResult ? 'Condition Met' : 'Condition Not Met'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-400" />
                Create Custom Automation Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rule ID
                  </label>
                  <Input
                    value={newRule.id}
                    onChange={(e) => setNewRule(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="custom-rule-1"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Model
                  </label>
                  <select
                    value={newRule.aiModel}
                    onChange={(e) => setNewRule(prev => ({ ...prev, aiModel: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="grd17">GRD1.7 (Primary Core)</option>
                    <option value="aleboss">ALEBOSS (Resource Manager)</option>
                    <option value="grd27">GRD2.7 (Deep Logic)</option>
                    <option value="aleofthought">ALEofThought (Reasoning)</option>
                    <option value="dangrd">DANGRD (Chaos Engine)</option>
                    <option value="grdviz">GRDVIZ (Vision Core)</option>
                    <option value="grdsprint">GRDSPRINT (Speed)</option>
                    <option value="norightanswergrd">NoRightAnswerGRD (Paradox)</option>
                    <option value="ale">ALE (Rapid Response)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Name
                </label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Custom Rule Name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this automation rule does..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority (1-3)
                </label>
                <select
                  value={newRule.priority}
                  onChange={(e) => setNewRule(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value={1}>1 - High Priority (Immediate)</option>
                  <option value={2}>2 - Medium Priority (Queued)</option>
                  <option value={3}>3 - Low Priority (Background)</option>
                </select>
              </div>
              
              <Button 
                disabled={!newRule.id || !newRule.name}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Automation Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}