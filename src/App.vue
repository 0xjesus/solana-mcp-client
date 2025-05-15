<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container">
        <div class="logo">
          <div class="solana-logo">
            <div class="gradient-circle"></div>
            <span class="s-letter">S</span>
          </div>
          <div class="title">
            Solana Analytics Chat
          </div>
        </div>
      </div>
    </header>

    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <ChatInterface />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatInterface from './components/ChatInterface.vue';

export default {
  name: 'App',
  components: {
    ChatInterface
  }
};
</script>

<style>
:root {
  --primary: #9945FF;
  --secondary: #14F195;
  --dark: #121212;
  --light: #F7F8FC;
  --solana-gradient: linear-gradient(90deg, #9945FF 0%, #14F195 100%);
}

body {
  background-color: #0D1117;
  color: var(--light);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
	background: #220123;
  padding-bottom: 40px;
}

.app-header {
  background: rgba(15, 20, 30, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px 0;
  border-bottom: 1px solid rgba(153, 69, 255, 0.3);
}

.logo {
  display: flex;
  align-items: center;
}

.solana-logo {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.gradient-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--solana-gradient);
  border-radius: 50%;
}

.s-letter {
  position: relative;
  color: white;
  font-weight: bold;
  font-size: 22px;
  z-index: 1;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.dashboard-card {
  background: rgba(25, 30, 40, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(153, 69, 255, 0.3);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #7b38cc;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
