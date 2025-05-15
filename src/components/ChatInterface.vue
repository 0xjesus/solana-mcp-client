<template>
  <div>
    <div class="dashboard-card chat-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-chat-dots-fill me-2"></i>
          Solana Analysis Assistant
        </h5>
        <button @click="clearChat" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-trash"></i>
        </button>
      </div>

      <div class="chat-messages" ref="chatContainer">
        <div v-if="chatHistory.length === 0" class="empty-chat">
          <div class="text-center p-4">
            <i class="bi bi-robot display-1 text-secondary"></i>
            <p class="mt-3 text-secondary">Start a conversation by asking about Solana wallets, tokens, or market activity.</p>
            <div class="suggestions mt-4">
              <button
                v-for="(suggestion, index) in suggestions"
                :key="index"
                @click="sendMessage(suggestion)"
                class="btn btn-sm btn-outline-primary suggestion-btn mb-2 me-2">
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-for="(message, index) in formattedChatHistory"
          :key="index"
          :class="['message-container', message.role === 'user' ? 'user-message' : 'assistant-message']">
          <div class="message-avatar">
            <i :class="message.role === 'user' ? 'bi bi-person-circle' : 'bi bi-robot'"></i>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              {{ message.content }}
              <div class="message-links" v-if="getWalletAddressFromMessage(message.content)">
                <button
                  @click="loadWallet(getWalletAddressFromMessage(message.content))"
                  class="btn btn-sm wallet-link">
                  <i class="bi bi-wallet2"></i> Load this wallet
                </button>
              </div>
            </div>
            <div class="message-time">{{ message.formattedTime }}</div>
          </div>
        </div>

        <div v-if="loading" class="assistant-typing">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              v-model="userInput"
              placeholder="Ask about Solana wallets, tokens, prices..."
              :disabled="loading"
              ref="inputField">
            <button
              class="btn send-btn"
              type="submit"
              :disabled="loading || !userInput.trim()">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </form>
        <div class="commands-hint mt-2">
          <small class="text-secondary">
            Commands: <span class="command">/tools</span> to see available tools,
            <span class="command">/clear</span> to clear history
          </small>
        </div>
      </div>
    </div>

    <!-- MCP Documentation Section -->
    <div class="dashboard-card mt-4 documentation-card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-lightning-charge-fill me-2"></i>
          Solana MCP: On-Chain Analytics & Intelligence
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <div class="mb-4">
              <h4 class="gradient-text"><i class="bi bi-stars me-2"></i>What is this?</h4>
              <p>
                This is a <strong>Model Context Protocol (MCP)</strong> implementation for Solana blockchain analytics. Our MCP enables AI assistants to access real-time on-chain data, providing immediate insights about wallets, tokens, market trends, and DeFi activity.
              </p>
            </div>

            <div class="feature-grid mb-4">
              <div class="feature-item">
                <div class="feature-icon"><i class="bi bi-speedometer2"></i></div>
                <h5>Real-time Data</h5>
                <p>Access current blockchain metrics including prices, transactions, and network activity</p>
              </div>

              <div class="feature-item">
                <div class="feature-icon"><i class="bi bi-wallet2"></i></div>
                <h5>Wallet Analysis</h5>
                <p>Analyze any Solana wallet's holdings, NFTs, and trading performance</p>
              </div>

              <div class="feature-item">
                <div class="feature-icon"><i class="bi bi-graph-up"></i></div>
                <h5>Token Insights</h5>
                <p>Track prices, holders, and detailed metrics for any SPL token</p>
              </div>

              <div class="feature-item">
                <div class="feature-icon"><i class="bi bi-code-slash"></i></div>
                <h5>Program Analytics</h5>
                <p>Monitor dApp usage, user engagement, and program health</p>
              </div>
            </div>

            <div class="mb-4">
              <h4 class="gradient-text"><i class="bi bi-gear me-2"></i>Architecture</h4>
              <p>
                Our MCP implementation follows a modern JSON-RPC architecture with optimized caching and resilient error handling. The system includes:
              </p>
              <ul class="architecture-list">
                <li><span class="highlight">MCP Server:</span> Express.js backend exposing a JSON-RPC endpoint with 20+ Solana analytics methods</li>
                <li><span class="highlight">Data Layer:</span> Integration with Vybe API for reliable on-chain data processing</li>
                <li><span class="highlight">AI Integration:</span> Support for OpenAI and Anthropic LLMs with automatic tool calling capabilities</li>
                <li><span class="highlight">Web Client:</span> Vue.js frontend providing intuitive interface for data exploration</li>
                <li><span class="highlight">Performance:</span> Redis caching for high-traffic optimization and reduced latency</li>
              </ul>
            </div>

            <div class="mb-4">
              <h4 class="gradient-text"><i class="bi bi-tools me-2"></i>Available Tools</h4>
              <div class="tool-grid">
                <div class="tool-category">
                  <h6><i class="bi bi-wallet-fill me-2"></i>Wallet Tools</h6>
                  <ul>
                    <li><code>solana_wallet_overview</code> - Comprehensive wallet summary</li>
                    <li><code>solana_wallet_tokens</code> - Token inventory with current values</li>
                    <li><code>solana_wallet_nfts</code> - NFT collection analysis</li>
                    <li><code>solana_wallet_pnl</code> - Trading performance metrics</li>
                  </ul>
                </div>

                <div class="tool-category">
                  <h6><i class="bi bi-currency-exchange me-2"></i>Token Tools</h6>
                  <ul>
                    <li><code>solana_token_price</code> - Current market prices</li>
                    <li><code>solana_token_details</code> - Comprehensive token data</li>
                    <li><code>solana_token_holders</code> - Ownership distribution</li>
                    <li><code>solana_token_ohlc</code> - Historical price charts</li>
                    <li><code>solana_token_transfers</code> - Recent transfer activity</li>
                  </ul>
                </div>

                <div class="tool-category">
                  <h6><i class="bi bi-globe me-2"></i>Network Tools</h6>
                  <ul>
                    <li><code>solana_network_activity</code> - System-wide metrics</li>
                    <li><code>solana_market_sentiment</code> - Market trend analysis</li>
                    <li><code>solana_whale_movements</code> - Large transaction tracking</li>
                  </ul>
                </div>

                <div class="tool-category">
                  <h6><i class="bi bi-code-square me-2"></i>Program Tools</h6>
                  <ul>
                    <li><code>solana_program_details</code> - Program metadata</li>
                    <li><code>solana_program_metrics</code> - Usage statistics</li>
                    <li><code>solana_program_users</code> - User engagement tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h4 class="gradient-text"><i class="bi bi-gem me-2"></i>What Makes This Special</h4>
              <div class="special-features">
                <div class="special-item">
                  <span class="number">01</span>
                  <h6>Advanced AI Integration</h6>
                  <p>Our MCP leverages function calling capabilities from OpenAI to automatically determine when to access blockchain data, making interactions feel natural and intuitive.</p>
                </div>

                <div class="special-item">
                  <span class="number">02</span>
                  <h6>Data Reliability</h6>
                  <p>Multi-source data verification ensures prices and metrics are accurate even when primary sources fail, with fallbacks to Pyth, CoinGecko and other trusted providers.</p>
                </div>

                <div class="special-item">
                  <span class="number">03</span>
                  <h6>Performance Optimization</h6>
                  <p>Intelligent caching with TTL-based expiration combined with parallel data fetching provides responses in milliseconds even for complex queries.</p>
                </div>

                <div class="special-item">
                  <span class="number">04</span>
                  <h6>Beautiful Visualization</h6>
                  <p>Not just raw data—our client transforms complex blockchain information into intuitive, visually appealing interfaces for all levels of users.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="gradient-text"><i class="bi bi-github me-2"></i>Repository</h4>
              <div class="repo-info">
                <p>
                  View the complete source code and contribute to the project on GitHub:
                </p>
                <a href="https://github.com/0xjesus/mcp-solana" class="repo-link" target="_blank">
                  <i class="bi bi-github me-2"></i>github.com/0xjesus/solana-mcp
                </a>
                <div class="mt-3">
                  <div class="tag">MIT License</div>
                  <div class="tag">Solana</div>
                  <div class="tag">MCP</div>
                  <div class="tag">AI</div>
                  <div class="tag">JavaScript</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { gsap } from 'gsap';
import mcpService from '../services/mcpService';

export default {
  name: 'ChatInterface',
  data() {
    return {
      userInput: '',
      suggestions: [
        'Show SOL price',
        'What are recent whale movements?',
        'Check wallet H3mq95J2GiwSBdAefMd6oUHTS3x81xyQDgkfcWPNiYJr',
        'What is the current Solana market sentiment?'
      ]
    };
  },
  computed: {
    ...mapState({
      chatHistory: state => state.chatHistory,
      loading: state => state.loading.chat
    }),
    formattedChatHistory() {
      return this.chatHistory.map(msg => ({
        ...msg,
        formattedTime: new Date(msg.timestamp).toLocaleTimeString()
      }));
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.userInput.trim()) return;

      const input = this.userInput.trim();
      this.userInput = '';

      // Handle commands
      if (input.startsWith('/')) {
        return this.handleCommand(input);
      }

      await this.sendMessage(input);
    },

    async sendMessage(message) {
      if (this.loading) return;

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      await this.$store.dispatch('sendChatMessage', message);

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // Focus input field
      this.$refs.inputField.focus();
    },

    async handleCommand(command) {
      command = command.toLowerCase();

      if (command === '/clear') {
        await this.$store.dispatch('clearChat');
      } else if (command === '/tools') {
        const tools = mcpService.getTools ? mcpService.getTools() : [
          { name: 'solana_wallet_overview', description: 'Get an overview of a Solana wallet' },
          { name: 'solana_token_price', description: 'Get the current price of a Solana token' },
          { name: 'solana_market_sentiment', description: 'Get market sentiment' }
        ];

        // Add a message with available tools
        this.$store.commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: 'Here are the available tools:\n\n' +
            tools.map(t => `• ${t.name}: ${t.description}`).join('\n'),
          timestamp: new Date()
        });

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } else {
        // Unknown command
        this.$store.commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: `Unrecognized command: ${command}. Available commands: /clear, /tools`,
          timestamp: new Date()
        });
      }
    },

    getWalletAddressFromMessage(message) {
      if (!message) return null;

      // Look for a Solana wallet address pattern
      const matches = message.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
      if (matches && matches.length > 0) {
        return matches[0];
      }
      return null;
    },

    async loadWallet(address) {
      if (!address) return;

      try {
        // Show loading message
        this.$store.commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: `Loading wallet ${address}...`,
          timestamp: new Date()
        });

        this.$emit('wallet-selected', address);

        // Provide confirmation
        this.$store.commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: `Wallet loaded! Now analyzing data for ${address.substring(0, 6)}...${address.substring(address.length - 4)}.`,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error loading wallet:', error);
        this.$store.commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: `Error loading wallet: ${error.message}`,
          timestamp: new Date()
        });
      }
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    clearChat() {
      this.$store.dispatch('clearChat');
    }
  },
  mounted() {
    // Welcome message
    setTimeout(() => {
      this.$store.commit('ADD_CHAT_MESSAGE', {
        role: 'assistant',
        content: 'Welcome to the Solana Analytics Dashboard! I can help you analyze wallets, check token prices, monitor network activity, and more. How can I assist you today?',
        timestamp: new Date()
      });
    }, 500);
  },
  updated() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
.chat-card {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  height: calc(100vh - 250px);
  min-height: 400px;
  margin-bottom: 20px;
  position: relative;
  background: rgba(25, 30, 40, 0.95);
  z-index: 100;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-header {
  background: rgba(153, 69, 255, 0.15);
  border-bottom: 1px solid rgba(153, 69, 255, 0.3);
  padding: 15px;
  border-radius: 11px 11px 0 0;
  z-index: 101;
}

.card-header h5 {
  color: white;
  font-weight: 600;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(25, 30, 40, 0.95);
}

.message-container {
  display: flex;
  margin-bottom: 15px;
  max-width: 85%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.assistant-message {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: var(--primary);
}

.assistant-message .message-avatar {
  background: var(--secondary);
}

.message-avatar i {
  font-size: 18px;
  color: #fff;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-message .message-bubble {
  background: var(--primary);
  color: white;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(153, 69, 255, 0.3);
}

.assistant-message .message-bubble {
  background: #2A3142;
  color: #ffffff;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 6px;
  align-self: flex-end;
}

.assistant-message .message-time {
  align-self: flex-start;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 30, 40, 0.95);
  z-index: 101;
  border-radius: 0 0 11px 11px;
}

.chat-input .form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 24px;
  padding: 10px 15px;
  transition: all 0.3s ease;
}

.chat-input .form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(153, 69, 255, 0.3);
}

.send-btn {
  background: var(--primary);
  color: white;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(153, 69, 255, 0.3);
}

.send-btn:hover:not(:disabled) {
  background: #8138e0;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: rgba(153, 69, 255, 0.5);
}

.assistant-typing {
  padding: 0 15px;
  margin-bottom: 15px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  background: #2A3142;
  padding: 12px 16px;
  border-radius: 18px;
  gap: 4px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.4s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.8);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-btn {
  background: rgba(153, 69, 255, 0.15);
  border: 1px solid rgba(153, 69, 255, 0.5);
  color: white;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.suggestion-btn:hover {
  background: rgba(153, 69, 255, 0.3);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.commands-hint {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.command {
  font-family: monospace;
  background: rgba(153, 69, 255, 0.15);
  padding: 2px 5px;
  border-radius: 3px;
}

.message-links {
  margin-top: 8px;
}

.wallet-link {
  font-size: 0.8rem;
  background: rgba(153, 69, 255, 0.15);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 3px 10px;
  transition: all 0.2s ease;
}

.wallet-link:hover {
  background: rgba(153, 69, 255, 0.3);
}

/* Documentation styles */
.documentation-card {
	color: white;
  background: linear-gradient(45deg, rgba(25, 30, 40, 0.97), rgba(40, 45, 60, 0.97));
  border: 1px solid rgba(153, 69, 255, 0.3);
}

.card-body {
  padding: 25px;
}

.gradient-text {
  background: var(--solana-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(153, 69, 255, 0.1);
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--solana-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
  color: white;
}

.architecture-list {
  list-style-type: none;
  padding-left: 10px;
}

.architecture-list li {
  margin-bottom: 10px;
  position: relative;
  padding-left: 25px;
}

.architecture-list li:before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--secondary);
}

.highlight {
  color: var(--primary);
  font-weight: 600;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.tool-category {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
}

.tool-category h6 {
  color: var(--secondary);
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.tool-category ul {
  list-style-type: none;
  padding-left: 5px;
}

.tool-category li {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.tool-category code {
  background: rgba(153, 69, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.special-features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.special-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.special-item .number {
  position: absolute;
  bottom: -20px;
  right: -10px;
  font-size: 80px;
  font-weight: 800;
  opacity: 0.1;
  z-index: -1;
}

.special-item h6 {
  color: white;
  margin-bottom: 10px;
}

.repo-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.repo-link {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.repo-link:hover {
  background: #8138e0;
  transform: translateY(-2px);
}

.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-right: 8px;
}
</style>
