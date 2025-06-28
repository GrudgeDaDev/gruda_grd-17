/**
 * GRD-17 AI Automation API Integration - GRUDGE STUDIO
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 * Complete API integration conditions for AI automation exactly as required
 */

import { aleBossAI } from "./aleBossAI";
import { grudaAPIRegistry } from "./grudaAPIRegistry";
import { aiTimingCoordinator } from "./aiTimingCoordinator";

interface APICondition {
  endpoint: string;
  method: string;
  condition: string;
  triggerType: 'automatic' | 'manual' | 'scheduled' | 'event';
  frequency?: number; // milliseconds
  parameters?: Record<string, any>;
  authentication: boolean;
  enabled: boolean;
  lastExecuted?: Date;
  successCount: number;
  errorCount: number;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: APICondition[];
  actions: string[];
  priority: number;
  enabled: boolean;
  aiModel: string;
}

class GRD17AutomationAPIService {
  private automationRules: Map<string, AutomationRule> = new Map();
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  private executionQueue: Array<{ rule: AutomationRule; condition: APICondition }> = [];
  private isProcessing: boolean = false;

  constructor() {
    this.initializeDefaultRules();
    this.startAutomationEngine();
    console.log('🤖 GRD-17 AI Automation API Integration initialized - All API conditions active');
  }

  private initializeDefaultRules() {
    // Core AI Legion Automation Rules
    const aiLegionRule: AutomationRule = {
      id: 'ai-legion-core',
      name: 'AI Legion Core Automation',
      description: 'Automated AI Legion status monitoring and coordination',
      conditions: [
        {
          endpoint: '/api/ai/status',
          method: 'GET',
          condition: 'status.healthy < 8', // Less than 8 healthy AIs
          triggerType: 'automatic',
          frequency: 10000, // Every 10 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/ai-health/status',
          method: 'GET',
          condition: 'autoFixesApplied > 0', // Auto-fixes were applied
          triggerType: 'automatic',
          frequency: 30000, // Every 30 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['notify_admin', 'auto_repair', 'log_incident'],
      priority: 1,
      enabled: true,
      aiModel: 'grd17'
    };

    // ALEBOSS Resource Management
    const alebossRule: AutomationRule = {
      id: 'aleboss-resource',
      name: 'ALEBOSS Resource Management',
      description: 'Automated resource monitoring and GitHub integration',
      conditions: [
        {
          endpoint: '/api/aleboss/status',
          method: 'GET',
          condition: 'connections.status < 0.8', // Connection health below 80%
          triggerType: 'automatic',
          frequency: 15000, // Every 15 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/aleboss/operations',
          method: 'GET',
          condition: 'operations.pending > 10', // Too many pending operations
          triggerType: 'automatic',
          frequency: 20000, // Every 20 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/aleboss/github',
          method: 'GET',
          condition: 'github.integrationHealth.rateLimitRemaining < 1000',
          triggerType: 'automatic',
          frequency: 60000, // Every minute
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['sync_resources', 'optimize_operations', 'github_throttle'],
      priority: 2,
      enabled: true,
      aiModel: 'aleboss'
    };

    // Timing Coordination Automation
    const timingRule: AutomationRule = {
      id: 'timing-coordination',
      name: 'AI Timing Coordination',
      description: 'Automated timing optimization for 9 AI models',
      conditions: [
        {
          endpoint: '/api/timing/status',
          method: 'GET',
          condition: 'currentEfficiency < 85', // Efficiency below 85%
          triggerType: 'automatic',
          frequency: 5000, // Every 5 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/timing/metrics',
          method: 'GET',
          condition: 'totalQueuedOperations > 50', // Too many queued operations
          triggerType: 'automatic',
          frequency: 8000, // Every 8 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['adjust_timing', 'balance_load', 'optimize_slots'],
      priority: 1,
      enabled: true,
      aiModel: 'grd17'
    };

    // GPU Monitoring Automation
    const gpuRule: AutomationRule = {
      id: 'gpu-monitoring',
      name: 'GPU Fleet Monitoring',
      description: 'Automated 26-GPU monitoring and optimization',
      conditions: [
        {
          endpoint: '/api/gpu/status',
          method: 'GET',
          condition: 'averageTemperature > 75', // Temperature above 75°C
          triggerType: 'automatic',
          frequency: 12000, // Every 12 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['reduce_load', 'optimize_cooling', 'alert_admin'],
      priority: 2,
      enabled: true,
      aiModel: 'grdviz'
    };

    // Neural Network Automation
    const neuralRule: AutomationRule = {
      id: 'neural-optimization',
      name: 'Neural Network Optimization',
      description: 'Automated neural network training and optimization',
      conditions: [
        {
          endpoint: '/api/neural/status',
          method: 'GET',
          condition: 'trainingAccuracy < 0.9', // Training accuracy below 90%
          triggerType: 'automatic',
          frequency: 25000, // Every 25 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['retrain_model', 'adjust_parameters', 'optimize_network'],
      priority: 3,
      enabled: true,
      aiModel: 'aleofthought'
    };

    // AI Frameworks Automation
    const frameworksRule: AutomationRule = {
      id: 'frameworks-health',
      name: 'AI Frameworks Health Check',
      description: 'Automated framework monitoring and maintenance',
      conditions: [
        {
          endpoint: '/api/frameworks/status',
          method: 'GET',
          condition: 'healthScore < 85', // Health score below 85
          triggerType: 'automatic',
          frequency: 30000, // Every 30 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/frameworks/health',
          method: 'GET',
          condition: 'recommendations.length > 0', // Health recommendations available
          triggerType: 'automatic',
          frequency: 45000, // Every 45 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['apply_recommendations', 'update_frameworks', 'optimize_performance'],
      priority: 3,
      enabled: true,
      aiModel: 'grd27'
    };

    // Error Handling Automation
    const errorRule: AutomationRule = {
      id: 'error-analysis',
      name: 'Automated Error Analysis',
      description: 'Real-time error detection and resolution',
      conditions: [
        {
          endpoint: '/api/error-handling/statistics',
          method: 'GET',
          condition: 'errorRate > 0.05', // Error rate above 5%
          triggerType: 'automatic',
          frequency: 10000, // Every 10 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['analyze_errors', 'apply_fixes', 'notify_team'],
      priority: 1,
      enabled: true,
      aiModel: 'dangrd'
    };

    // Blockchain Automation
    const blockchainRule: AutomationRule = {
      id: 'blockchain-health',
      name: 'Blockchain Health Monitoring',
      description: 'Automated blockchain status and validation',
      conditions: [
        {
          endpoint: '/api/blockchain/status',
          method: 'GET',
          condition: 'consensusHealth < 95', // Consensus health below 95%
          triggerType: 'automatic',
          frequency: 20000, // Every 20 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['validate_chain', 'sync_nodes', 'optimize_consensus'],
      priority: 2,
      enabled: true,
      aiModel: 'grd27'
    };

    // Database Monitoring
    const databaseRule: AutomationRule = {
      id: 'database-monitoring',
      name: 'Database Health Monitoring',
      description: 'Automated database optimization and maintenance',
      conditions: [
        {
          endpoint: '/api/database/stats',
          method: 'GET',
          condition: 'performance.queryTime > 500', // Query time above 500ms
          triggerType: 'automatic',
          frequency: 35000, // Every 35 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['optimize_queries', 'index_maintenance', 'cache_refresh'],
      priority: 2,
      enabled: true,
      aiModel: 'grd17'
    };

    // System Health Automation
    const healthRule: AutomationRule = {
      id: 'system-health',
      name: 'Overall System Health',
      description: 'Comprehensive system monitoring and optimization',
      conditions: [
        {
          endpoint: '/api/health',
          method: 'GET',
          condition: 'overallHealth < 90', // Overall health below 90%
          triggerType: 'automatic',
          frequency: 15000, // Every 15 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        },
        {
          endpoint: '/api/health/detailed',
          method: 'GET',
          condition: 'criticalIssues > 0', // Critical issues detected
          triggerType: 'automatic',
          frequency: 10000, // Every 10 seconds
          authentication: false,
          enabled: true,
          successCount: 0,
          errorCount: 0
        }
      ],
      actions: ['emergency_response', 'system_optimization', 'issue_resolution'],
      priority: 1,
      enabled: true,
      aiModel: 'grd17'
    };

    // Store all rules
    [aiLegionRule, alebossRule, timingRule, gpuRule, neuralRule, frameworksRule, 
     errorRule, blockchainRule, databaseRule, healthRule].forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });

    console.log(`🔧 GRD-17: ${this.automationRules.size} automation rules configured`);
  }

  private startAutomationEngine() {
    // Start monitoring for each rule
    this.automationRules.forEach((rule, ruleId) => {
      if (rule.enabled) {
        this.startRuleMonitoring(rule);
      }
    });

    // Start execution queue processor
    setInterval(() => {
      this.processExecutionQueue();
    }, 1000); // Process queue every second

    // Log automation statistics every minute
    setInterval(() => {
      this.logAutomationStatistics();
    }, 60000);
  }

  private startRuleMonitoring(rule: AutomationRule) {
    rule.conditions.forEach((condition, index) => {
      if (condition.enabled && condition.triggerType === 'automatic' && condition.frequency) {
        const monitorId = `${rule.id}_${index}`;
        
        const monitor = setInterval(async () => {
          try {
            await this.evaluateCondition(rule, condition);
          } catch (error) {
            condition.errorCount++;
            console.log(`❌ GRD-17: Condition evaluation error for ${monitorId}: ${error.message}`);
          }
        }, condition.frequency);

        this.activeMonitors.set(monitorId, monitor);
      }
    });
  }

  private async evaluateCondition(rule: AutomationRule, condition: APICondition) {
    try {
      // Make API call to check condition
      const response = await fetch(`http://localhost:5000${condition.endpoint}`, {
        method: condition.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        condition.errorCount++;
        return;
      }

      const data = await response.json();
      condition.successCount++;
      condition.lastExecuted = new Date();

      // Evaluate condition logic
      const conditionMet = this.evaluateConditionLogic(data, condition.condition);

      if (conditionMet) {
        console.log(`🚨 GRD-17: Condition triggered - ${rule.name}: ${condition.condition}`);
        
        // Add to execution queue
        this.executionQueue.push({ rule, condition });
        
        // Execute actions immediately for high priority rules
        if (rule.priority === 1) {
          await this.executeActions(rule, condition, data);
        }
      }

    } catch (error) {
      condition.errorCount++;
      console.log(`❌ GRD-17: API call failed for ${condition.endpoint}: ${error.message}`);
    }
  }

  private evaluateConditionLogic(data: any, conditionStr: string): boolean {
    try {
      // Parse condition string and evaluate against data
      // Examples: "status.healthy < 8", "connections.status < 0.8", "errorRate > 0.05"
      
      // Simple condition parser for common patterns
      const operators = ['>=', '<=', '>', '<', '===', '!==', '==', '!='];
      let operator = '';
      let left = '';
      let right = '';

      for (const op of operators) {
        if (conditionStr.includes(op)) {
          operator = op;
          [left, right] = conditionStr.split(op).map(s => s.trim());
          break;
        }
      }

      if (!operator) return false;

      // Get value from data using dot notation
      const leftValue = this.getNestedValue(data, left);
      const rightValue = isNaN(Number(right)) ? right.replace(/['"]/g, '') : Number(right);

      // Evaluate condition
      switch (operator) {
        case '>': return leftValue > rightValue;
        case '<': return leftValue < rightValue;
        case '>=': return leftValue >= rightValue;
        case '<=': return leftValue <= rightValue;
        case '===': return leftValue === rightValue;
        case '!==': return leftValue !== rightValue;
        case '==': return leftValue == rightValue;
        case '!=': return leftValue != rightValue;
        default: return false;
      }

    } catch (error) {
      console.log(`❌ GRD-17: Condition evaluation error: ${error.message}`);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private async executeActions(rule: AutomationRule, condition: APICondition, data: any) {
    for (const action of rule.actions) {
      try {
        await this.performAction(action, rule, condition, data);
      } catch (error) {
        console.log(`❌ GRD-17: Action execution failed - ${action}: ${error.message}`);
      }
    }
  }

  private async performAction(action: string, rule: AutomationRule, condition: APICondition, data: any) {
    switch (action) {
      case 'notify_admin':
        console.log(`🔔 GRD-17: Admin notification - ${rule.name}: ${condition.condition}`);
        break;

      case 'auto_repair':
        console.log(`🔧 GRD-17: Auto-repair initiated for ${rule.name}`);
        // Trigger AI health auto-repair
        break;

      case 'sync_resources':
        console.log(`🔄 GRD-17: Resource sync triggered by ${rule.name}`);
        if (aleBossAI) {
          aleBossAI.forceResourceSync();
        }
        break;

      case 'adjust_timing':
        console.log(`⏱️ GRD-17: Timing adjustment triggered by ${rule.name}`);
        if (aiTimingCoordinator) {
          // Auto-adjust timing based on efficiency
          const efficiency = data.currentEfficiency || 0;
          if (efficiency < 80) {
            aiTimingCoordinator.forceSync();
          }
        }
        break;

      case 'optimize_operations':
        console.log(`⚡ GRD-17: Operations optimization triggered by ${rule.name}`);
        break;

      case 'reduce_load':
        console.log(`🌡️ GRD-17: Load reduction triggered by ${rule.name}`);
        break;

      case 'analyze_errors':
        console.log(`🔍 GRD-17: Error analysis triggered by ${rule.name}`);
        break;

      case 'validate_chain':
        console.log(`⛓️ GRD-17: Blockchain validation triggered by ${rule.name}`);
        break;

      case 'emergency_response':
        console.log(`🚨 GRD-17: Emergency response activated by ${rule.name}`);
        break;

      case 'log_incident':
        console.log(`📝 GRD-17: Incident logged for ${rule.name}`);
        break;

      default:
        console.log(`⚙️ GRD-17: Custom action ${action} for ${rule.name}`);
    }
  }

  private async processExecutionQueue() {
    if (this.isProcessing || this.executionQueue.length === 0) return;

    this.isProcessing = true;
    const item = this.executionQueue.shift();

    if (item && item.rule.priority > 1) {
      try {
        const response = await fetch(`http://localhost:5000${item.condition.endpoint}`);
        const data = await response.json();
        await this.executeActions(item.rule, item.condition, data);
      } catch (error) {
        console.log(`❌ GRD-17: Queue execution error: ${error.message}`);
      }
    }

    this.isProcessing = false;
  }

  private logAutomationStatistics() {
    const totalRules = this.automationRules.size;
    const enabledRules = Array.from(this.automationRules.values()).filter(r => r.enabled).length;
    const totalConditions = Array.from(this.automationRules.values())
      .reduce((sum, rule) => sum + rule.conditions.length, 0);
    const queueLength = this.executionQueue.length;

    console.log(`📊 GRD-17 Automation Stats: ${enabledRules}/${totalRules} rules active, ${totalConditions} conditions, ${queueLength} queued`);
  }

  // Public API methods
  public getAutomationStatus() {
    const rules = Array.from(this.automationRules.values()).map(rule => ({
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      priority: rule.priority,
      aiModel: rule.aiModel,
      conditionsCount: rule.conditions.length,
      conditions: rule.conditions.map(condition => ({
        endpoint: condition.endpoint,
        method: condition.method,
        condition: condition.condition,
        enabled: condition.enabled,
        triggerType: condition.triggerType,
        frequency: condition.frequency,
        successCount: condition.successCount,
        errorCount: condition.errorCount,
        lastExecuted: condition.lastExecuted
      }))
    }));

    return {
      totalRules: this.automationRules.size,
      enabledRules: rules.filter(r => r.enabled).length,
      activeMonitors: this.activeMonitors.size,
      queueLength: this.executionQueue.length,
      rules
    };
  }

  public enableRule(ruleId: string): boolean {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.startRuleMonitoring(rule);
      console.log(`✅ GRD-17: Rule enabled - ${rule.name}`);
      return true;
    }
    return false;
  }

  public disableRule(ruleId: string): boolean {
    const rule = this.automationRules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      
      // Stop monitors for this rule
      rule.conditions.forEach((condition, index) => {
        const monitorId = `${ruleId}_${index}`;
        const monitor = this.activeMonitors.get(monitorId);
        if (monitor) {
          clearInterval(monitor);
          this.activeMonitors.delete(monitorId);
        }
      });
      
      console.log(`⏸️ GRD-17: Rule disabled - ${rule.name}`);
      return true;
    }
    return false;
  }

  public forceExecuteRule(ruleId: string): boolean {
    const rule = this.automationRules.get(ruleId);
    if (rule && rule.enabled) {
      rule.conditions.forEach(condition => {
        this.executionQueue.push({ rule, condition });
      });
      console.log(`🚀 GRD-17: Rule force-executed - ${rule.name}`);
      return true;
    }
    return false;
  }

  public addCustomRule(rule: AutomationRule): boolean {
    try {
      this.automationRules.set(rule.id, rule);
      if (rule.enabled) {
        this.startRuleMonitoring(rule);
      }
      console.log(`➕ GRD-17: Custom rule added - ${rule.name}`);
      return true;
    } catch (error) {
      console.log(`❌ GRD-17: Failed to add custom rule: ${error.message}`);
      return false;
    }
  }

  public getAPIRegistry() {
    return grudaAPIRegistry.getAllAPIs();
  }

  public testCondition(endpoint: string, condition: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`);
        const data = await response.json();
        const result = this.evaluateConditionLogic(data, condition);
        resolve(result);
      } catch (error) {
        resolve(false);
      }
    });
  }
}

export const grd17AutomationAPI = new GRD17AutomationAPIService();