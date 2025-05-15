// src/store/index.js
import { createStore } from 'vuex';
import mcpService from '../services/mcpService';

export default createStore({
  state: {
    chatHistory: [],
    loading: {
      chat: false
    }
  },

  mutations: {
    ADD_CHAT_MESSAGE(state, message) {
      state.chatHistory.push(message);
    },
    CLEAR_CHAT_HISTORY(state) {
      state.chatHistory = [];
    },
    SET_LOADING(state, { key, value }) {
      state.loading[key] = value;
    }
  },

  actions: {
    async sendChatMessage({ commit }, message) {
      commit('SET_LOADING', { key: 'chat', value: true });
      commit('ADD_CHAT_MESSAGE', { role: 'user', content: message, timestamp: new Date() });

      try {
        const response = await mcpService.generateWithLLM(message);
        commit('ADD_CHAT_MESSAGE', { role: 'assistant', content: response, timestamp: new Date() });
        return response;
      } catch (error) {
        console.error('Error sending chat message:', error);
        commit('ADD_CHAT_MESSAGE', {
          role: 'assistant',
          content: 'Lo siento, pero he encontrado un error al procesar tu solicitud. Por favor, intenta de nuevo.',
          timestamp: new Date(),
          error: true
        });
      } finally {
        commit('SET_LOADING', { key: 'chat', value: false });
      }
    },

    async clearChat({ commit }) {
      await mcpService.clearContext();
      commit('CLEAR_CHAT_HISTORY');
    }
  },

  getters: {
    formattedChatHistory: (state) => {
      return state.chatHistory.map(msg => ({
        ...msg,
        formattedTime: new Date(msg.timestamp).toLocaleTimeString()
      }));
    }
  }
});
