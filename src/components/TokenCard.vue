<template>
  <div class="dashboard-card token-card">
    <div class="token-header">
      <div class="token-icon" :style="{ background: getTokenColor() }">
        {{ tokenInitial }}
      </div>
      <div class="token-name">
        <h6 class="mb-0">{{ token.name }}</h6>
        <div class="token-symbol">{{ token.symbol }}</div>
      </div>
    </div>

    <div class="token-body">
      <div class="price-section">
        <div class="current-price">
          ${{ parseFloat(token.price_usd).toFixed(token.price_usd < 0.1 ? 4 : 2) }}
          <span
            class="price-change"
            :class="token.price_change_24h >= 0 ? 'positive' : 'negative'">
            <i :class="token.price_change_24h >= 0 ? 'bi-arrow-up-short' : 'bi-arrow-down-short'"></i>
            {{ Math.abs(token.price_change_24h).toFixed(2) }}%
          </span>
        </div>
      </div>

      <div class="token-chart">
        <div class="chart-placeholder" ref="chartContainer"></div>
      </div>

      <div class="token-details">
        <div class="detail-row">
          <div class="detail-label">Balance</div>
          <div class="detail-value">{{ formatBalance(token.balance) }} {{ token.symbol }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Value</div>
          <div class="detail-value">${{ formatNumber(token.value_usd) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap';

export default {
  name: 'TokenCard',
  props: {
    token: {
      type: Object,
      required: true
    }
  },
  computed: {
    tokenInitial() {
      if (!this.token.symbol) return '?';
      return this.token.symbol.charAt(0).toUpperCase();
    }
  },
  methods: {
    getTokenColor() {
      // Generate consistent color based on token symbol
      const symbol = this.token.symbol || '';
      const charCode = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const hue = charCode % 360;
      return `hsl(${hue}, 70%, 50%)`;
    },

    formatNumber(num) {
      if (!num && num !== 0) return '0';

      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      }

      return num.toFixed(2);
    },

    formatBalance(balance) {
      if (!balance && balance !== 0) return '0';

      if (balance >= 1000000) {
        return (balance / 1000000).toFixed(2) + 'M';
      } else if (balance >= 1000) {
        return (balance / 1000).toFixed(2) + 'K';
      }

      // For very small numbers (like Shiba Inu), show more decimals
      if (balance < 0.0001) {
        return balance.toExponential(2);
      }

      return balance.toFixed(balance < 0.1 ? 4 : 2);
    },

    createDummyChart() {
      const container = this.$refs.chartContainer;
      if (!container) return;

      // Clear container
      container.innerHTML = '';

      // Create SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 200 60');

      // Generate random chart data simulating price history
      const points = [];
      const count = 20;
      const trend = this.token.price_change_24h >= 0 ? 1 : -1;

      for (let i = 0; i < count; i++) {
        const x = (i / (count - 1)) * 200;

        // Create a somewhat realistic looking chart
        // with the trend generally following the 24h change
        let y;
        if (i === 0) {
          y = 30 + (Math.random() * 10);
        } else {
          const prevY = points[i - 1].split(',')[1];
          const randomChange = (Math.random() * 5) - 2;
          const trendInfluence = trend * (Math.random() * 0.8);
          y = parseFloat(prevY) + randomChange + trendInfluence;

          // Keep within bounds
          y = Math.min(Math.max(y, 5), 55);
        }

        points.push(`${x},${y}`);
      }

      // Create path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${points.join(' L ')}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', this.token.price_change_24h >= 0 ? '#14F195' : '#FF453A');
      path.setAttribute('stroke-width', '2');

      // Add path to SVG
      svg.appendChild(path);

      // Add SVG to container
      container.appendChild(svg);

      // Animate the path
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.out'
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.createDummyChart();

      // Animate numbers
      gsap.from(this.$el.querySelector('.current-price'), {
        textContent: 0,
        duration: 1.5,
        ease: 'power1.out',
        onUpdate: function() {
          // Only update the main price, not the change percentage
          const el = this.targets()[0];
          const currentText = el.textContent;
          const percentIndex = currentText.indexOf('%');
          const dollarIndex = currentText.indexOf('$');

          if (percentIndex > -1 && dollarIndex > -1) {
            const priceText = currentText.substring(dollarIndex + 1, currentText.indexOf('<')).trim();
            const priceValue = parseFloat(priceText);

            if (!isNaN(priceValue)) {
              const formattedPrice = priceValue < 0.1
                ? priceValue.toFixed(4)
                : priceValue.toFixed(2);

              // Keep the percentage part unchanged
              const newText = `$${formattedPrice}${currentText.substring(currentText.indexOf('<'))}`;
              el.innerHTML = newText;
            }
          }
        }
      });
    });
  }
};
</script>

<style scoped>
.token-card {
  position: relative;
  height: 100%;
  transition: all 0.3s ease;
}

.token-card:hover {
  transform: translateY(-5px);
}

.token-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.token-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  margin-right: 12px;
}

.token-name h6 {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.token-symbol {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.token-body {
  display: flex;
  flex-direction: column;
}

.price-section {
  margin-bottom: 15px;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

.price-change {
  font-size: 0.85rem;
  font-weight: normal;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.price-change i {
  font-size: 1.2rem;
}

.positive {
  color: var(--secondary);
}

.negative {
  color: #FF453A;
}

.token-chart {
  margin-bottom: 15px;
}

.chart-placeholder {
  height: 60px;
  width: 100%;
}

.token-details {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
