import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class MCPService {
  constructor() {
    this.sessionId = `mcp-web-${uuidv4()}`;
    this.requestIdCounter = 1;
    this.apiUrl = '/api';
    this.apiKey = process.env.VUE_APP_MCP_SERVER_API_KEY;
    this.llmModel = process.env.VUE_APP_LLM_MODEL || 'gpt-4o';

    // Memory for conversation
    this.memory = {
      messages: [],
      toolCalls: []
    };
  }

  async callMcp(method, params = {}) {
    const requestId = this.requestIdCounter++;

    console.log(`[MCP CALL] Method: ${method}`);
    console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);

    const payload = {
      jsonrpc: '2.0',
      method,
      params,
      id: requestId
    };

    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });

      if (response.data.error) {
        throw new Error(`MCP error: ${response.data.error.message}`);
      }

      // Record the tool call
      this.memory.toolCalls.push({
        method,
        params,
        requestId,
        timestamp: new Date().toISOString()
      });

      return response.data.result;
    } catch (error) {
      console.error(`Error in MCP call: ${error.message}`);
      throw error;
    }
  }

  extractText(result, defaultValue = 'No data available') {
    if (result && result.content && result.content[0] && result.content[0].text) {
      return result.content[0].text;
    }
    return defaultValue;
  }

  async generateWithLLM(prompt) {
    const isOpenAI = this.llmModel.toLowerCase().includes('gpt');

    if (isOpenAI) {
      // Format for OpenAI models
      const systemContent = 'You are an AI assistant specialized in Solana blockchain analysis. Use the available tools to help the user when needed. Always respond in English.';

      const messages = this.memory.messages.length > 0
        ? [...this.memory.messages, { role: 'user', content: prompt }]
        : [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt }
          ];

      // Define OpenAI function calling format
      const params = {
        model: this.llmModel,
        messages: messages,
        max_tokens: 2000,
        session_id: this.sessionId
      };

      // Add tools if it's GPT-4/GPT-4o
      if (this.llmModel.includes('gpt-4')) {
        params.tools = this.getTools();
        params.tool_choice = 'auto';
      }

      const result = await this.callMcp('openai_generate', params);

      // Save the user message to memory first
      if (this.memory.messages.length === 0) {
        this.memory.messages.push({ role: 'system', content: systemContent });
      }
      this.memory.messages.push({ role: 'user', content: prompt });

      // Handle tool calls if present
      if (result && result.tool_calls && result.tool_calls.length > 0) {
        console.log(`[TOOL CALLS] AI decided to use ${result.tool_calls.length} tools`);

        // Save initial assistant response that includes tool calls
        const initialResponse = this.extractText(result);
        this.memory.messages.push({
          role: 'assistant',
          content: initialResponse,
          tool_calls: result.tool_calls
        });

        // Handle each tool call
        for (const toolCall of result.tool_calls) {
          try {
            console.log(`[TOOL CALL] Executing: ${toolCall.function.name}`);

            // Parse arguments
            const args = JSON.parse(toolCall.function.arguments);

            // Execute appropriate tool
            let toolResult;
            switch(toolCall.function.name) {
              case 'solana_wallet_overview':
                toolResult = await this.getWalletOverview(args.address);
                break;
              case 'solana_wallet_tokens':
                toolResult = await this.getWalletTokens(args.address, args.include_no_price, args.limit);
                break;
              case 'solana_token_price':
                if (args.symbol) {
                  toolResult = await this.getTokenPrice(args.symbol);
                } else if (args.mint_address) {
                  toolResult = await this.getTokenPrice(args.mint_address);
                }
                break;
              case 'solana_wallet_pnl':
                toolResult = await this.getWalletPnL(args.address);
                break;
              case 'solana_market_sentiment':
                toolResult = await this.getMarketSentiment();
                break;
              case 'solana_whale_movements':
                toolResult = await this.getWhaleMovements(args.min_usd_amount, args.limit);
                break;
              case 'solana_network_activity':
                toolResult = await this.getNetworkActivity();
                break;
              default:
                throw new Error(`Unknown tool: ${toolCall.function.name}`);
            }

            // Extract and format the result
            const toolResultText = this.extractText(toolResult);

            // Add tool result to memory
            this.memory.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: toolResultText
            });
          } catch (error) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);

            // Add error as tool result
            this.memory.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: `Error: ${error.message}`
            });
          }
        }

        // Get final response that incorporates tool results
        const finalResponse = await this.callMcp('openai_generate', {
          model: this.llmModel,
          messages: this.memory.messages,
          max_tokens: 2000,
          session_id: this.sessionId
        });

        const finalResponseText = this.extractText(finalResponse);
        this.memory.messages.push({
          role: 'assistant',
          content: finalResponseText
        });

        return finalResponseText;
      } else {
        // Normal response without tool calls
        const responseContent = this.extractText(result);
        this.memory.messages.push({
          role: 'assistant',
          content: responseContent
        });

        return responseContent;
      }
    } else {
      // Format for Anthropic/Claude - using a prompt string
      let fullPrompt = '';

      if (this.memory.messages.length === 0) {
        fullPrompt = 'You are an AI assistant specialized in Solana blockchain analysis. Use the available tools to help the user. Always respond in English.\n\n';

        // Add system message to memory
        this.memory.messages.push({
          role: 'system',
          content: 'You are an AI assistant specialized in Solana blockchain analysis. Use the available tools to help the user. Always respond in English.'
        });
      }

      // Add conversation history
      for (const msg of this.memory.messages) {
        if (msg.role === 'system') continue;

        if (msg.role === 'user') {
          fullPrompt += `Human: ${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n\n`;
        } else if (msg.role === 'tool') {
          fullPrompt += `Tool Result (${msg.name}): ${msg.content}\n\n`;
        }
      }

      fullPrompt += `Human: ${prompt}\n\nAssistant: `;

      const result = await this.callMcp('anthropic_generate', {
        prompt: fullPrompt,
        model: this.llmModel,
        max_tokens: 2000,
        session_id: this.sessionId
      });

      // Save the exchange in memory
      this.memory.messages.push({ role: 'user', content: prompt });

      const responseContent = this.extractText(result);
      this.memory.messages.push({ role: 'assistant', content: responseContent });

      return responseContent;
    }
  }

  async getWalletOverview(address) {
    return this.callMcp('solana_wallet_overview', { address });
  }

  async getWalletTokens(address, includeNoPrice = false, limit = 10) {
    return this.callMcp('solana_wallet_tokens', {
      address,
      include_no_price: includeNoPrice,
      limit
    });
  }

  async getTokenPrice(symbolOrMint) {
    // Determine if input is a symbol or mint address
    const params = {};
    if (symbolOrMint.length < 15) {
      params.symbol = symbolOrMint;
    } else {
      params.mint_address = symbolOrMint;
    }

    return this.callMcp('solana_token_price', params);
  }

  async getWalletPnL(address) {
    return this.callMcp('solana_wallet_pnl', { address });
  }

  async getMarketSentiment() {
    return this.callMcp('solana_market_sentiment', {});
  }

  async getWhaleMovements(minUsdAmount = 100000, limit = 5) {
    return this.callMcp('solana_whale_movements', {
      min_usd_amount: minUsdAmount,
      limit
    });
  }

  async getNetworkActivity() {
    return this.callMcp('solana_network_activity', {});
  }

  async clearContext() {
    try {
      await this.callMcp('clear_context', {
        session_id: this.sessionId
      });

      this.memory.messages = [];
      this.memory.toolCalls = [];

      return true;
    } catch (error) {
      console.warn(`Failed to clear context: ${error.message}`);
      return false;
    }
  }

  getTools() {
    return [
      {
        type: "function",
        function: {
          name: 'solana_wallet_overview',
          description: 'Get an overview of a Solana wallet, including total value, number of tokens, and NFTs',
          parameters: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Solana wallet address'
              }
            },
            required: ['address']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_wallet_tokens',
          description: 'Get tokens in a Solana wallet',
          parameters: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Solana wallet address'
              },
              include_no_price: {
                type: 'boolean',
                description: 'Include tokens without price data'
              },
              limit: {
                type: 'integer',
                description: 'Maximum number of tokens to return'
              }
            },
            required: ['address']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_token_price',
          description: 'Get the current price of a Solana token',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Token symbol (e.g., SOL, USDC)'
              },
              mint_address: {
                type: 'string',
                description: 'Token mint address (alternative to symbol)'
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_wallet_pnl',
          description: 'Get Profit and Loss (PnL) data for a Solana wallet',
          parameters: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Solana wallet address'
              }
            },
            required: ['address']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_market_sentiment',
          description: 'Get current Solana market sentiment based on token prices and program activity',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_whale_movements',
          description: 'Get recent large transactions (whale movements) on Solana',
          parameters: {
            type: 'object',
            properties: {
              min_usd_amount: {
                type: 'number',
                description: 'Minimum USD value to consider a whale movement'
              },
              limit: {
                type: 'integer',
                description: 'Maximum number of movements to return'
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'solana_network_activity',
          description: 'Get overall Solana network activity metrics',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      }
    ];
  }
}

export default new MCPService();
