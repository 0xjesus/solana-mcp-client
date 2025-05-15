<template>
  <header class="dashboard-header">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <div class="logo-container">
              <div class="solana-logo">
                <div class="gradient-circle"></div>
                <span class="s-letter">S</span>
              </div>
            </div>
            <div>
              <h1 class="mb-0">Solana Analytics</h1>
              <p class="header-subtitle">Real-time blockchain insights</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="d-flex align-items-center justify-content-end">
            <div class="market-status me-4" v-if="marketSentiment">
              <div class="sentiment-badge" :class="sentimentClass">
                {{ marketSentiment.sentiment }}
              </div>
              <div class="sol-price">
                <i class="bi bi-currency-exchange me-1"></i>
                SOL: ${{ marketSentiment.sol_price.toFixed(2) }}
                <span :class="priceChangeClass">
                  <i :class="priceChangeIcon"></i>
                  {{ Math.abs(marketSentiment.price_change_24h).toFixed(2) }}%
                </span>
              </div>
            </div>
            <button class="theme-toggle btn" @click="toggleTheme">
              <i class="bi" :class="isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import { gsap } from 'gsap';

export default {
  name: 'DashboardHeader',
  data() {
    return {
      isDarkMode: true
    };
  },
  computed: {
    ...mapState({
      marketSentiment: state => state.marketSentiment
    }),
    sentimentClass() {
      if (!this.marketSentiment) return '';

      switch (this.marketSentiment.sentiment.toLowerCase()) {
        case 'bullish':
          return 'bullish';
        case 'bearish':
          return 'bearish';
        case 'neutral':
          return 'neutral';
        default:
          return '';
      }
    },
    priceChangeClass() {
      if (!this.marketSentiment) return '';

      return this.marketSentiment.price_change_24h >= 0
        ? 'text-success'
        : 'text-danger';
    },
    priceChangeIcon() {
      if (!this.marketSentiment) return '';

      return this.marketSentiment.price_change_24h >= 0
        ? 'bi-arrow-up-short'
        : 'bi-arrow-down-short';
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('light-mode');

      // Save preference
      localStorage.setItem('darkMode', this.isDarkMode);
    }
  },
  mounted() {
    // Animate header elements
    gsap.from('.dashboard-header', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    gsap.from('.solana-logo', {
      rotation: 360,
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)',
      delay: 0.3
    });

    // Check saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
      if (!this.isDarkMode) {
        document.body.classList.add('light-mode');
      }
    }
  }
};
</script>

<style scoped>
.dashboard-header {
  padding: 20px 0;
  background: rgba(15, 20, 30, 0.7);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-container {
  margin-right: 15px;
}

.solana-logo {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--solana-gradient);
  border-radius: 50%;
  animation: pulse 3s infinite ease-in-out;
}

.s-letter {
  position: relative;
  color: white;
  font-weight: bold;
  font-size: 22px;
  z-index: 1;
}

h1 {
  font-size: 1.8rem;
  font-weight: 600;
  background: var(--solana-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.market-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sentiment-badge {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 12px;
  margin-bottom: 5px;
  font-weight: 500;
  text-transform: capitalize;
}

.bullish {
  background: rgba(20, 241, 149, 0.2);
  color: #14F195;
}

.bearish {
  background: rgba(255, 69, 58, 0.2);
  color: #FF453A;
}

.neutral {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sol-price {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.sol-price span {
  margin-left: 8px;
  font-size: 0.8rem;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
}

.theme-toggle i {
  font-size: 1.2rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  h1 {
    font-size: 1.4rem;
  }

  .market-status {
    margin-top: 10px;
    align-items: flex-start;
  }
}
</style>
