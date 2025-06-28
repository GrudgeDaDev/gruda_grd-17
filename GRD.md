# GRD-17 Node Operation Guide
## www.grudgeplatform.com/wallet Integration

### Overview

GRD-17 (GRUDGE Distributed Resource Node - version 17) is the core system administrator and security coordinator for the GRUDGE STUDIO ecosystem. This guide covers operating a GRD-17 node through the wallet platform interface.

---

## Table of Contents

1. [Node Architecture](#node-architecture)
2. [Wallet Platform Integration](#wallet-platform-integration)
3. [Node Setup and Configuration](#node-setup-and-configuration)
4. [Mining Operations](#mining-operations)
5. [Validator Functions](#validator-functions)
6. [API Endpoints](#api-endpoints)
7. [Security Protocols](#security-protocols)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Operations](#advanced-operations)

---

## Node Architecture

### GRD-17 Core Components

```
┌─────────────────────────────────────────┐
│             GRD-17 Node                 │
├─────────────────┬───────────────────────┤
│   Wallet Hub    │    Mining Engine      │
│   - Multi-chain │    - Keweebec2 Algo   │
│   - GRUDA/SOL   │    - FM Protocol      │
│   - ETH/MATIC   │    - GPU/CPU Mining   │
├─────────────────┼───────────────────────┤
│   Validator     │    Security Core      │
│   - Consensus   │    - Threat Detection │
│   - Staking     │    - Access Control   │
│   - Rewards     │    - Audit Logging    │
├─────────────────┼───────────────────────┤
│   AI Legion     │    Network Relay      │
│   - 9 AI Models │    - Cross-chain      │
│   - Coordination│    - Bridge Ops       │
│   - Processing  │    - P2P Communication│
└─────────────────┴───────────────────────┘
```

### System Requirements

- **Minimum**: 4GB RAM, 2 CPU cores, 50GB storage
- **Recommended**: 8GB RAM, 4 CPU cores, 100GB SSD
- **Optimal**: 16GB RAM, 8 CPU cores, 500GB NVMe SSD
- **Network**: Stable internet, 10 Mbps up/down
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

---

## Wallet Platform Integration

### Accessing Your Node

1. **Navigate to**: https://www.grudgeplatform.com/wallet
2. **Login Methods**:
   - Web3 wallet connection (MetaMask, Phantom)
   - GRUDGE Studio account
   - Node operator credentials

### Dashboard Overview

```
┌─────────────────────────────────────────────────┐
│  GRUDGE Platform Wallet - Node Operations      │
├─────────────────┬───────────────────────────────┤
│ Wallet Info     │ Node Status                   │
│ ├ Address       │ ├ Online/Offline              │
│ ├ Balance       │ ├ Sync Status                 │
│ ├ Tokens        │ ├ Peer Count                  │
│ └ Staking       │ └ Last Block                  │
├─────────────────┼───────────────────────────────┤
│ Mining Stats    │ Validator Status              │
│ ├ Hash Rate     │ ├ Validator Active            │
│ ├ Blocks Found  │ ├ Stake Amount                │
│ ├ Earnings      │ ├ Rewards Earned              │
│ └ Uptime        │ └ Slash Risk                  │
├─────────────────┴───────────────────────────────┤
│ Quick Actions                                   │
│ [Start Mining] [Enable Validator] [Claim Rewards]│
│ [Node Settings] [Backup Wallet] [View Logs]     │
└─────────────────────────────────────────────────┘
```

### Initial Setup

1. **Generate Node Wallet**:
   ```javascript
   // Automatic wallet generation
   const nodeWallet = await grudgePlatform.wallet.generate({
     type: 'node-operator',
     chains: ['gruda', 'solana', 'ethereum', 'polygon'],
     backup: true
   });
   ```

2. **Configure Node Identity**:
   - Set node name and description
   - Choose operating regions
   - Configure network preferences
   - Set mining/validator preferences

3. **Download Node Software**:
   ```bash
   # One-click installer from wallet interface
   curl -sSL https://install.grudgeplatform.com/node | bash
   
   # Or manual download
   wget https://releases.grudgeplatform.com/grd-17-node-latest.tar.gz
   ```

---

## Node Setup and Configuration

### Environment Configuration

Create configuration file: `~/.gruda/node.conf`

```ini
[node]
name=my-gruda-node
region=us-west-2
network=mainnet
data_dir=/home/user/.gruda/data

[wallet]
address=gruda1abcd...
private_key_file=/home/user/.gruda/keys/node.key
backup_seed_file=/home/user/.gruda/keys/seed.txt

[mining]
enabled=true
algorithm=keweebec2
threads=auto
gpu_enabled=true
fm_protocol=true

[validator]
enabled=false
stake_amount=1000000
commission_rate=0.05
slash_protection=true

[api]
enabled=true
bind_address=127.0.0.1
port=8545
auth_token=your_secure_token

[security]
encryption=aes256
firewall=true
audit_logging=true
threat_detection=true
```

### Startup Commands

```bash
# Standard startup
./gruda-node start --config ~/.gruda/node.conf

# Development mode
./gruda-node start --dev --log-level debug

# Mining only
./gruda-node start --mining-only --threads 8

# Validator only
./gruda-node start --validator-only --stake 1000000

# Full node with all features
./gruda-node start --full-node --enable-all
```

### Web Interface Setup

```bash
# Enable web dashboard
./gruda-node dashboard --enable --port 8080

# Access at: http://localhost:8080
# Default credentials: admin / your_node_auth_token
```

---

## Mining Operations

### Keweebec2 Algorithm

GRUDA uses the proprietary Keweebec2 mining algorithm:

- **Type**: Proof-of-Work hybrid with AI assistance
- **Hash Function**: SHA3-256 with BLAKE2b mixing
- **Difficulty**: Auto-adjusting every 120 blocks
- **Block Time**: 30 seconds average
- **Reward**: 12.5 GRUDA per block (halving every 4 years)

### Mining Configuration

```json
{
  "mining": {
    "algorithm": "keweebec2",
    "pools": [
      "stratum+tcp://pool1.grudgemining.com:4444",
      "stratum+tcp://pool2.grudgemining.com:4444"
    ],
    "worker_name": "gruda_node_001",
    "cpu_threads": 4,
    "gpu_enabled": true,
    "gpu_devices": [0, 1],
    "power_limit": 80,
    "temperature_limit": 85,
    "fm_radio": {
      "enabled": true,
      "frequency": "146.52",
      "power": "5W",
      "mesh_networking": true
    }
  }
}
```

### FM Radio Protocol

GRD-17 nodes use FM radio for offline synchronization:

```bash
# Configure FM radio module
./gruda-node fm-config \
  --frequency 146.52 \
  --power 5W \
  --callsign YOUR_CALLSIGN \
  --mesh-mode

# Test FM connectivity
./gruda-node fm-test --ping-nearby-nodes

# Enable emergency sync mode
./gruda-node fm-emergency --sync-blocks
```

### Mining Commands

```bash
# Start mining
curl -X POST http://localhost:8545/api/mining/start \
  -H "Authorization: Bearer $NODE_TOKEN" \
  -d '{"threads": 8, "gpu": true}'

# Stop mining
curl -X POST http://localhost:8545/api/mining/stop \
  -H "Authorization: Bearer $NODE_TOKEN"

# Get mining statistics
curl http://localhost:8545/api/mining/stats \
  -H "Authorization: Bearer $NODE_TOKEN"

# Response example:
{
  "hashrate": "125.6 MH/s",
  "blocks_found": 42,
  "shares_submitted": 15420,
  "earnings": "156.25 GRUDA",
  "uptime": "72h 15m",
  "temperature": "67°C",
  "power_consumption": "180W"
}
```

---

## Validator Functions

### Becoming a Validator

1. **Stake Requirements**:
   - Minimum: 1,000,000 GRUDA tokens
   - Recommended: 5,000,000 GRUDA tokens
   - Maximum effective: 100,000,000 GRUDA tokens

2. **Enable Validator**:
   ```bash
   # Stake tokens and activate validator
   ./gruda-node validator enable \
     --stake 5000000 \
     --commission 0.05 \
     --moniker "My GRUDA Validator"
   ```

3. **Validator Configuration**:
   ```json
   {
     "validator": {
       "moniker": "My GRUDA Validator",
       "website": "https://myvalidator.com",
       "security_contact": "security@myvalidator.com",
       "details": "Professional GRUDA validator",
       "commission": {
         "rate": "0.050000000000000000",
         "max_rate": "0.100000000000000000",
         "max_change_rate": "0.010000000000000000"
       },
       "min_self_delegation": "1000000",
       "delegator_shares": "5000000.000000000000000000"
     }
   }
   ```

### Consensus Participation

GRD-17 validators participate in Tendermint-based consensus:

```bash
# Monitor consensus rounds
./gruda-node consensus status

# View validator set
./gruda-node query staking validators

# Check signing info
./gruda-node query slashing signing-info $(gruda-node tendermint show-validator)
```

### Validator Rewards

- **Block Rewards**: Share of 12.5 GRUDA per block
- **Transaction Fees**: Percentage of all transaction fees
- **Delegation Rewards**: Commission from delegated stakes
- **AI Validation Bonus**: Extra rewards for AI-assisted validation

---

## API Endpoints

### Node Management

```bash
# Get node status
GET /api/node/status
Response: {
  "status": "online",
  "sync_info": {
    "latest_block_height": "12345",
    "latest_block_time": "2024-01-15T10:30:00Z",
    "catching_up": false
  },
  "validator_info": {
    "address": "grudavalcons1...",
    "voting_power": "1000000"
  }
}

# Get network info
GET /api/network/info
Response: {
  "network": "gruda-mainnet-1",
  "chain_id": "gruda-1",
  "genesis_time": "2024-01-01T00:00:00Z",
  "peers": 156,
  "validators": 125
}
```

### Wallet Operations

```bash
# Get wallet balance
GET /api/wallet/balance
Response: {
  "address": "gruda1abcd...",
  "balances": [
    {
      "denom": "ugruda",
      "amount": "1000000000"
    }
  ]
}

# Send transaction
POST /api/wallet/send
Body: {
  "to": "gruda1efgh...",
  "amount": "1000000",
  "memo": "Payment for services"
}
```

### Mining API

```bash
# Mining statistics
GET /api/mining/stats
Response: {
  "hashrate": "125600000",
  "hashrate_unit": "H/s",
  "blocks_found": 42,
  "difficulty": "1048576",
  "pool_connected": true,
  "workers": 8,
  "temperature": 67,
  "power_watts": 180
}

# Start/stop mining
POST /api/mining/start
POST /api/mining/stop
```

### Validator API

```bash
# Validator status
GET /api/validator/status
Response: {
  "validator_address": "grudavalcons1...",
  "operator_address": "grudavaloper1...",
  "consensus_pubkey": "grudavalconspub1...",
  "jailed": false,
  "status": "BOND_STATUS_BONDED",
  "tokens": "5000000000000",
  "delegator_shares": "5000000000000.000000000000000000",
  "commission": {
    "commission_rates": {
      "rate": "0.050000000000000000",
      "max_rate": "0.100000000000000000",
      "max_change_rate": "0.010000000000000000"
    },
    "update_time": "2024-01-15T10:30:00Z"
  }
}
```

---

## Security Protocols

### GRD-17 Security Features

1. **Access Control**:
   - Multi-factor authentication
   - API token rotation
   - IP whitelisting
   - Rate limiting

2. **Encryption**:
   - AES-256 for local data
   - TLS 1.3 for network communication
   - Hardware security module support
   - Key derivation from secure seed

3. **Threat Detection**:
   - Real-time monitoring
   - Anomaly detection
   - Intrusion prevention
   - Automated response

### Security Configuration

```bash
# Enable firewall
./gruda-node security firewall enable

# Set up fail2ban
./gruda-node security fail2ban \
  --max-attempts 5 \
  --ban-time 3600

# Configure HSM
./gruda-node security hsm \
  --device /dev/ttyUSB0 \
  --pin-file ~/.gruda/hsm.pin

# Enable audit logging
./gruda-node security audit enable \
  --log-file /var/log/gruda-audit.log \
  --max-size 100MB
```

### Backup and Recovery

```bash
# Backup wallet and keys
./gruda-node backup create \
  --output ~/.gruda/backup-$(date +%Y%m%d).tar.gz \
  --encrypt \
  --password-file ~/.gruda/backup.key

# Restore from backup
./gruda-node backup restore \
  --input ~/.gruda/backup-20240115.tar.gz \
  --password-file ~/.gruda/backup.key

# Test backup integrity
./gruda-node backup verify \
  --input ~/.gruda/backup-20240115.tar.gz
```

---

## Troubleshooting

### Common Issues

1. **Node Won't Start**:
   ```bash
   # Check configuration
   ./gruda-node config validate

   # Check port availability
   netstat -tulpn | grep :8545

   # Check logs
   tail -f ~/.gruda/logs/node.log
   ```

2. **Mining Problems**:
   ```bash
   # Check GPU status
   ./gruda-node mining gpu-status

   # Test mining algorithm
   ./gruda-node mining test-algo

   # Reset mining state
   ./gruda-node mining reset
   ```

3. **Sync Issues**:
   ```bash
   # Force resync
   ./gruda-node sync reset --hard

   # Check peers
   ./gruda-node network peers

   # Manual peer addition
   ./gruda-node network add-peer tcp://peer1.gruda.network:26656
   ```

### Log Analysis

```bash
# Real-time logs
tail -f ~/.gruda/logs/node.log

# Error-only logs
grep ERROR ~/.gruda/logs/node.log

# Mining-specific logs
grep MINING ~/.gruda/logs/node.log

# Validator logs
grep VALIDATOR ~/.gruda/logs/node.log
```

### Performance Monitoring

```bash
# System resource usage
./gruda-node monitor resources

# Network performance
./gruda-node monitor network

# Mining efficiency
./gruda-node monitor mining

# Validator performance
./gruda-node monitor validator
```

---

## Advanced Operations

### Cross-Chain Bridge Operations

GRD-17 nodes can operate cross-chain bridges:

```bash
# Enable bridge operator
./gruda-node bridge enable \
  --chains solana,ethereum,polygon \
  --min-confirmations 12

# Process bridge requests
./gruda-node bridge process \
  --auto-approve-under 1000 \
  --require-multisig-over 10000

# Monitor bridge health
./gruda-node bridge status
```

### AI Legion Integration

```bash
# Enable AI assistance
./gruda-node ai enable \
  --models grd17,aleofthought,grdviz \
  --confidence-threshold 0.85

# AI-assisted validation
./gruda-node ai validate-block \
  --block-height 12345 \
  --ai-consensus-required

# AI performance monitoring
./gruda-node ai stats
```

### Smart Contract Deployment

```bash
# Deploy EVM contract
./gruda-node contracts deploy \
  --bytecode contract.bin \
  --abi contract.abi \
  --gas-limit 2000000

# Interact with contract
./gruda-node contracts call \
  --address 0x1234... \
  --method "transfer(address,uint256)" \
  --params "0x5678...,1000000000000000000"
```

### Custom Development

```javascript
// Node.js SDK example
const GrudaNode = require('@gruda/node-sdk');

const node = new GrudaNode({
  endpoint: 'http://localhost:8545',
  authToken: process.env.GRUDA_NODE_TOKEN
});

// Monitor new blocks
node.on('newBlock', (block) => {
  console.log(`New block: ${block.height}`);
});

// Custom mining logic
node.mining.onShare((share) => {
  if (share.difficulty > 1000000) {
    console.log('High-value share found!');
  }
});
```

---

## Support and Resources

### Documentation Links

- **API Reference**: https://docs.grudgeplatform.com/api
- **Mining Guide**: https://docs.grudgeplatform.com/mining
- **Validator Guide**: https://docs.grudgeplatform.com/validator
- **Security Best Practices**: https://docs.grudgeplatform.com/security

### Community Support

- **Discord**: https://discord.gg/grudge-studio
- **Telegram**: https://t.me/gruda_official
- **Reddit**: https://reddit.com/r/GrudgeStudio
- **GitHub**: https://github.com/GrudgeDaDev

### Technical Support

- **Support Email**: support@grudgeplatform.com
- **Emergency Contact**: emergency@grudgeplatform.com
- **Security Issues**: security@grudgeplatform.com

---

*Last Updated: December 28, 2024*
*Version: GRD-17.2.1*
*Document ID: GRUDA-NODE-OPS-001*
