<template>
	<div class="dashboard-card whale-activity-card">
		<div class="card-header d-flex justify-content-between align-items-center">
			<h5 class="mb-0">
				<i class="bi bi-currency-exchange me-2"></i>
				Whale Movements
			</h5>
			<button @click="refreshData" class="btn btn-sm btn-outline-secondary refresh-btn" :disabled="isLoading">
				<i class="bi" :class="isLoading ? 'bi-arrow-repeat spin' : 'bi-arrow-repeat'"></i>
			</button>
		</div>

		<div v-if="isLoading" class="loading-container">
			<div class="spinner-border text-primary spinner-sm" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>

		<div v-else-if="whaleMovements && whaleMovements.length > 0" class="whale-movements">
			<transition-group name="fade" tag="div" class="movements-list">
				<div v-for="(movement, index) in whaleMovements" :key="index" class="movement-item">
					<div class="movement-icon" :class="movement.type === 'sell' ? 'sell' : 'buy'">
						<i :class="movement.type === 'sell' ? 'bi-arrow-down' : 'bi-arrow-up'"></i>
					</div>
					<div class="movement-details">
						<div class="movement-token">
							{{ movement.token_symbol || movement.token_name }}
							<span class="movement-type">{{ movement.type === 'sell' ? 'Sold' : 'Bought' }}</span>
						</div>
						<div class="movement-value">${{ formatNumber(movement.usd_amount) }}</div>
						<div class="movement-addresses">
							<div class="address">
								<span class="label">From:</span>
								<span class="value">{{ truncateAddress(movement.from_address) }}</span>
							</div>
							<div class="address">
								<span class="label">To:</span>
								<span class="value">{{ truncateAddress(movement.to_address) }}</span>
							</div>
						</div>
						<div class="movement-time">{{ formatTimeAgo(movement.timestamp) }}</div>
					</div>
				</div>
			</transition-group>
		</div>

		<div v-else class="empty-state">
			<i class="bi bi-tsunami display-6 mb-3"></i>
			<p>No whale movements detected recently</p>
		</div>
	</div>
</template>

<script>
	import { mapState, mapGetters } from 'vuex';
	import { gsap } from 'gsap';
	import moment from 'moment';

	export default {
		name: 'WhaleActivity',
		computed: {
			...mapState({
				whaleMovements: state => state.whaleMovements,
				loading: state => state.loading.whales,
			}),
		},
		methods: {
			formatNumber(num) {
				if(!num) return '0';

				if(num >= 1000000) {
					return (num / 1000000).toFixed(2) + 'M';
				} else if(num >= 1000) {
					return (num / 1000).toFixed(2) + 'K';
				}

				return num.toFixed(2);
			},

			truncateAddress(address) {
				if(!address) return '';

				return address.substring(0, 4) + '...' + address.substring(address.length - 4);
			},

			formatTimeAgo(timestamp) {
				if(!timestamp) return '';

				return moment(timestamp).fromNow();
			},

			refreshData() {
				this.$store.dispatch('fetchWhaleMovements');
			},

			animateItems() {
				gsap.from('.movement-item', {
					opacity: 0,
					y: 20,
					stagger: 0.1,
					duration: 0.5,
					ease: 'power2.out',
				});
			},
		},
		mounted() {
			// Fetch whale movements if not already loaded
			if((!this.whaleMovements || this.whaleMovements.length === 0) && !this.isLoading) {
				this.$store.dispatch('fetchWhaleMovements');
			} else {
				this.$nextTick(() => {
					this.animateItems();
				});
			}
		},
		watch: {
			whaleMovements(newVal, oldVal) {
				if(newVal && newVal.length > 0 && (!oldVal || oldVal.length === 0)) {
					this.$nextTick(() => {
						this.animateItems();
					});
				}
			},
		},
	};
</script>

<style scoped>
	.whale-activity-card {
		margin-bottom: 20px;
	}

	.card-header {
		background: rgba(153, 69, 255, 0.1);
		border-bottom: 1px solid rgba(153, 69, 255, 0.2);
		padding: 15px;
		border-radius: 11px 11px 0 0;
	}

	.refresh-btn {
		width: 32px;
		height: 32px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
		transition: all 0.2s ease;
	}

	.refresh-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.refresh-btn:disabled {
		opacity: 0.5;
	}

	.spin {
		animation: spinner 1s linear infinite;
	}

	@keyframes spinner {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}

	.spinner-sm {
		width: 1.5rem;
		height: 1.5rem;
		border-width: 0.2em;
	}

	.whale-movements {
		max-height: 400px;
		overflow-y: auto;
		padding: 15px;
	}

	.movements-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.movement-item {
		display: flex;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		padding: 12px;
		transition: all 0.2s ease;
	}

	.movement-item:hover {
		background: rgba(255, 255, 255, 0.06);
		transform: translateX(5px);
	}

	.movement-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
		flex-shrink: 0;
	}

	.movement-icon.buy {
		background: rgba(20, 241, 149, 0.2);
		color: var(--secondary);
	}

	.movement-icon.sell {
		background: rgba(255, 69, 58, 0.2);
		color: #FF453A;
	}

	.movement-details {
		flex: 1;
	}

	.movement-token {
		font-weight: 600;
		font-size: 0.95rem;
		margin-bottom: 5px;
		display: flex;
		align-items: center;
	}

	.movement-type {
		font-size: 0.75rem;
		font-weight: normal;
		margin-left: 8px;
		padding: 2px 8px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
	}

	.movement-value {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 5px;
	}

	.movement-addresses {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 5px;
		font-size: 0.8rem;
	}

	.address {
		display: flex;
		align-items: center;
	}

	.address .label {
		color: rgba(255, 255, 255, 0.6);
		margin-right: 5px;
	}

	.address .value {
		font-family: monospace;
		background: rgba(255, 255, 255, 0.05);
		padding: 2px 5px;
		border-radius: 4px;
	}

	.movement-time {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
	}

	/* Animation classes */
	.fade-enter-active, .fade-leave-active {
		transition: all 0.5s;
	}

	.fade-enter-from, .fade-leave-to {
		opacity: 0;
		transform: translateY(30px);
	}
</style>
