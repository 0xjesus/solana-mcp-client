<template>
  <div class="dashboard-card wallet-overview-card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="bi bi-wallet-fill me-2"></i>
        Wallet Overview
      </h5>
      <div class="wallet-address">
        <span class="address-chip">
          {{ truncatedAddress }}
          <button class="copy-btn" @click="copyAddress" :title="copyTooltip">
            <i class="bi" :class="copied ? 'bi-check' : 'bi-clipboard'"></i>
          </button>
        </span>
      </div>
    </div>

    <div class="wallet-content">
      <div class="row">
        <div class="col-md-4">
          <div class="wallet-summary">
            <div class="total-value">
              <span class="label">Total Value</span>
              <span class="value">${{ formatNumber(wallet.total_value_usd) }}</span>
            </div>

            <div class="token-counts mt-4">
              <div class="count-item">
                <div class="count-circle">
                  <i class="bi bi-coin"></i>
                </div>
                <div class="count-details">
                  <span class="count">{{ wallet.token_count }}</span>
                  <span class="label">Tokens</span>
                </div>
              </div>

              <div class="count-item">
                <div class="count-circle">
                  <i class="bi bi-image"></i>
                </div>
                <div class="count-details">
                  <span class="count">{{ wallet.nft_count }}</span>
                  <span class="label">NFTs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="wallet-stats">
            <div class="row">
              <div class="col-md-6 col-6">
                <div class="stat-item">
                  <div class="stat-header">
                    <i class="bi bi-graph-up-arrow"></i>
                    <span>PnL (24h)</span>
                  </div>
                  <div class="stat-value" :class="wallet.pnl_24h >= 0 ? 'positive' : 'negative'">
                    {{ wallet.pnl_24h >= 0 ? '+' : '' }}${{ formatNumber(wallet.pnl_24h) }}
                    <span>({{ wallet.pnl_percent_24h.toFixed(2) }}%)</span>
                  </div>
                </div>
              </div>

              <div class="col-md-6 col-6">
                <div class="stat-item">
                  <div class="stat-header">
                    <i class="bi bi-calendar2-check"></i>
                    <span>Last Activity</span>
                  </div>
                  <div class="stat-value">
                    {{ formatTimeAgo(wallet.last_activity_time) }}
                  </div>
                </div>
              </div>

              <div class="col-md-6 col-6">
                <div class="stat-item">
                  <div class="stat-header">
                    <i class="bi bi-arrow-down-circle"></i>
                    <span>Received (7d)</span>
                  </div>
                  <div class="stat-value">
                    ${{ formatNumber(wallet.received_7d) }}
                  </div>
                </div>
              </div>

              <div class="col-md-6 col-6">
                <div class="stat-item">
                  <div class="stat-header">
                    <i class="bi bi-arrow-up-circle"></i>
                    <span>Sent (7d)</span>
                  </div>
                  <div class="stat-value">
                    ${{ formatNumber(wallet.sent_7d) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="wallet-labels">
            <div v-if="wallet.labels && wallet.labels.length > 0">
              <span class="label-title">Labels:</span>
              <span
                v-for="(label, index) in wallet.labels"
                :key="index"
                class="wallet-label"
                :style="{ background: getRandomLabelColor(label) }">
                {{ label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap';
import moment from 'moment';

export default {
  name: 'WalletOverview',
  props: {
    wallet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      copied: false,
      copyTooltip: 'Copy address',
      labelColors: {}
    };
  },
  computed: {
    truncatedAddress() {
      if (!this.wallet.address) return '';

      const addr = this.wallet.address;
      return addr.substring(0, 4) + '...' + addr.substring(addr.length - 4);
    }
  },
  methods: {
    formatNumber(num) {
      if (!num && num !== 0) return '0';

      if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      }

      return num.toFixed(2);
    },

    copyAddress() {
      if (!this.wallet.address) return;

      navigator.clipboard.writeText(this.wallet.address).then(() => {
        this.copied = true;
        this.copyTooltip = 'Copied!';

        setTimeout(() => {
          this.copied = false;
          this.copyTooltip = 'Copy address';
        }, 2000);
      });
    },

    formatTimeAgo(timestamp) {
      if (!timestamp) return 'N/A';

      return moment(timestamp).fromNow();
    },

    getRandomLabelColor(label) {
      // Use consistent colors for the same labels
      if (!this.labelColors[label]) {
        const colors = [
          'rgba(153, 69, 255, 0.7)',
          'rgba(20, 241, 149, 0.7)',
          'rgba(255, 184, 0, 0.7)',
          'rgba(66, 133, 244, 0.7)',
          'rgba(219, 68, 55, 0.7)',
          'rgba(15, 157, 88, 0.7)'
        ];

        const index = Math.floor(label.length % colors.length);
        this.labelColors[label] = colors[index];
      }

      return this.labelColors[label];
    },

    animateWalletData() {
      // Animate total value
      gsap.from('.total-value .value', {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function() {
          // Format with dollar sign and commas
          const value = parseFloat(this.targets()[0].textContent);
          if (value >= 1000000) {
            this.targets()[0].textContent = '$' + (value / 1000000).toFixed(2) + 'M';
          } else if (value >= 1000) {
            this.targets()[0].textContent = '$' + (value / 1000).toFixed(2) + 'K';
          } else {
            this.targets()[0].textContent = '$' + value.toFixed(2);
          }
        }
      });

      // Animate token and NFT counts
      gsap.from('.count', {
        textContent: 0,
        duration: 1.5,
        ease: 'power1.out',
        snap: { textContent: 1 },
        stagger: 0.3
      });

      // Animate stats
      gsap.from('.stat-value', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.animateWalletData();
    });
  },
  watch: {
    wallet() {
      this.$nextTick(() => {
        this.animateWalletData();
      });
    }
  }
};
</script>

<style scoped>
.wallet-overview-card {
  position: relative;
  overflow: hidden;
}

.card-header {
  background: rgba(153, 69, 255, 0.1);
  border-bottom: 1px solid rgba(153, 69, 255, 0.2);
  padding: 15px 20px;
  border-radius: 11px 11px 0 0;
}

.wallet-address {
  display: flex;
  align-items: center;
}

.address-chip {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 20px;
  font-family: monospace;
  font-size: 0.9rem;
}

.copy-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-left: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.copy-btn:hover {
  color: var(--secondary);
}

.wallet-content {
  padding: 20px;
}

.wallet-summary {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.total-value {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.total-value .label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.total-value .value {
  font-size: 2.2rem;
  font-weight: 700;
  background: var(--solana-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.token-counts {
  display: flex;
  gap: 20px;
}

.count-item {
  display: flex;
  align-items: center;
}

.count-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.count-circle i {
  font-size: 1.2rem;
  color: var(--primary);
}

.count-details {
  display: flex;
  flex-direction: column;
}

.count-details .count {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.count-details .label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.wallet-stats {
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
}

.stat-item {
  margin-bottom: 15px;
}

.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.stat-header i {
  margin-right: 8px;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.stat-value span {
  font-size: 0.85rem;
  font-weight: normal;
  margin-left: 5px;
  opacity: 0.8;
}

.positive {
  color: var(--secondary);
}

.negative {
  color: #FF453A;
}

.wallet-labels {
  margin-top: 10px;
}

.label-title {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 10px;
}

.wallet-label {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: white;
  margin-right: 8px;
  margin-bottom: 8px;
}

/* Shimmering effect on the card */
.wallet-overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: skewX(-25deg);
  animation: shimmer 6s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .wallet-stats {
    padding-left: 0;
    border-left: none;
    margin-top: 20px;
  }

  .total-value .value {
    font-size: 1.8rem;
  }

  .count-details .count {
    font-size: 1.3rem;
  }
}
</style>
