<template>
	<div class="dashboard-card network-status-card">
		<h5 class="card-title">
			<i class="bi bi-hdd-network-fill me-2"></i>
			Network Status
		</h5>

		<div v-if="isLoading" class="loading-container">
			<div class="spinner-border text-primary spinner-sm" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>

		<div v-else-if="networkStatus" class="network-metrics">
			<div class="row">
				<div class="col-md-3 col-6">
					<div class="metric">
						<div class="metric-name">TPS</div>
						<div class="metric-value">{{ networkStatus.tps }}</div>
						<div class="metric-chart">
							<div class="progress-container">
								<div class="progress" style="height: 6px;">
									<div
										class="progress-bar bg-primary"
										:style="`width: ${Math.min(networkStatus.tps / 5000 * 100, 100)}%`"
									>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col-md-3 col-6">
					<div class="metric">
						<div class="metric-name">Daily Transactions</div>
						<div class="metric-value">{{ formatNumber(networkStatus.daily_transactions) }}</div>
						<div class="trend" :class="getStatusClass(networkStatus.tx_change_percent)">
							<i :class="getStatusIcon(networkStatus.tx_change_percent)"></i>
							{{ Math.abs(networkStatus.tx_change_percent).toFixed(1) }}%
						</div>
					</div>
				</div>

				<div class="col-md-3 col-6">
					<div class="metric">
						<div class="metric-name">Active Users</div>
						<div class="metric-value">{{ formatNumber(networkStatus.active_wallets) }}</div>
						<div class="trend" :class="getStatusClass(networkStatus.user_change_percent)">
							<i :class="getStatusIcon(networkStatus.user_change_percent)"></i>
							{{ Math.abs(networkStatus.user_change_percent).toFixed(1) }}%
						</div>
					</div>
				</div>

				<div class="col-md-3 col-6">
					<div class="metric">
						<div class="metric-name">TVL (USD)</div>
						<div class="metric-value">${{ formatNumber(networkStatus.total_value_locked) }}</div>
						<div class="trend" :class="getStatusClass(networkStatus.tvl_change_percent)">
							<i :class="getStatusIcon(networkStatus.tvl_change_percent)"></i>
							{{ Math.abs(networkStatus.tvl_change_percent).toFixed(1) }}%
						</div>
					</div>
				</div>
			</div>

			<div class="network-alerts mt-3" v-if="networkStatus.alerts && networkStatus.alerts.length > 0">
				<h6><i class="bi bi-exclamation-triangle-fill me-2"></i> Alerts</h6>
				<div class="alert-list">
					<div v-for="(alert, index) in networkStatus.alerts" :key="index" class="alert-item">
						<i class="bi bi-dot me-2"></i>
						{{ alert }}
					</div>
				</div>
			</div>
		</div>

		<div v-else class="text-center p-4 text-secondary">
			<i class="bi bi-exclamation-circle display-6"></i>
			<p class="mt-3">Unable to fetch network status</p>
		</div>
	</div>
</template>

<script>
	import { mapState, mapGetters } from 'vuex';
	import { gsap } from 'gsap';

	export default {
		name: 'NetworkStatus',
		computed: {
			...mapState({
				networkStatus: state => state.networkStatus,
				loading: state => state.loading.network,
			}),
		},
		methods: {
			formatNumber(num) {
				if(!num) return '0';

				if(num >= 1000000) {
					return (num / 1000000).toFixed(1) + 'M';
				} else if(num >= 1000) {
					return (num / 1000).toFixed(1) + 'K';
				}

				return num.toString();
			},

			getStatusClass(percent) {
				if(!percent) return '';

				return percent >= 0 ? 'positive' : 'negative';
			},

			getStatusIcon(percent) {
				if(!percent) return '';

				return percent >= 0
					? 'bi bi-arrow-up-short'
					: 'bi bi-arrow-down-short';
			},

			animateMetrics() {
				gsap.from('.metric-value', {
					textContent: 0,
					duration: 2,
					ease: 'power1.inOut',
					snap: { textContent: 1 },
					stagger: 0.2,
					onUpdate: function() {
						this.targets().forEach(target => {
							// Skip if the content isn't numeric
							if(isNaN(parseFloat(target.textContent.replace(/[^0-9.-]+/g, '')))) {
								return;
							}

							// Format with appropriate suffixes
							let value = parseFloat(target.textContent);
							if(value >= 1000000) {
								target.textContent = (value / 1000000).toFixed(1) + 'M';
							} else if(value >= 1000) {
								target.textContent = (value / 1000).toFixed(1) + 'K';
							} else {
								target.textContent = value.toFixed(0);
							}
						});
					},
				});

				gsap.from('.progress-bar', {
					width: 0,
					duration: 1.5,
					ease: 'power2.out',
					delay: 0.3,
				});
			},
		},
		watch: {
			networkStatus(newValue) {
				if(newValue) {
					this.$nextTick(() => {
						this.animateMetrics();
					});
				}
			},
		},
		mounted() {
			if(this.networkStatus) {
				this.$nextTick(() => {
					this.animateMetrics();
				});
			}

			// Fetch network status if not already loaded
			if(!this.networkStatus && !this.isLoading) {
				this.$store.dispatch('fetchNetworkStatus');
			}
		},
	};
</script>

<style scoped>
	.network-status-card {
		position: relative;
		overflow: hidden;
	}

	.card-title {
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		color: rgba(255, 255, 255, 0.9);
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 150px;
	}

	.spinner-sm {
		width: 1.5rem;
		height: 1.5rem;
		border-width: 0.2em;
	}

	.network-metrics {
		position: relative;
	}

	.metric {
		position: relative;
		margin-bottom: 25px;
	}

	.metric-name {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 5px;
	}

	.metric-value {
		font-size: 1.8rem;
		font-weight: 600;
		background: var(--solana-gradient);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		margin-bottom: 5px;
	}

	.trend {
		font-size: 0.85rem;
		display: flex;
		align-items: center;
	}

	.positive {
		color: var(--secondary);
	}

	.negative {
		color: #FF453A;
	}

	.metric-chart {
		margin-top: 8px;
	}

	.progress-container {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar {
		background: var(--solana-gradient);
	}

	.network-alerts {
		background: rgba(255, 87, 34, 0.1);
		border-left: 3px solid #FF5722;
		padding: 10px 15px;
		border-radius: 4px;
	}

	.network-alerts h6 {
		color: #FF5722;
		font-size: 0.9rem;
		margin-bottom: 10px;
	}

	.alert-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.alert-item {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
		display: flex;
		align-items: center;
	}

	/* Pulse animation for the background */
	.network-status-card::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(
			circle,
			rgba(153, 69, 255, 0.1) 0%,
			rgba(20, 241, 149, 0.05) 50%,
			transparent 70%
		);
		opacity: 0.3;
		animation: pulse-bg 15s infinite linear;
		z-index: -1;
	}

	@keyframes pulse-bg {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.metric-value {
			font-size: 1.4rem;
		}

		.metric {
			margin-bottom: 20px;
		}
	}
</style>
