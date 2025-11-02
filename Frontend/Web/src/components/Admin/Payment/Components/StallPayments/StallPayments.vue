<template>
  <div class="stall-payments">
    <div class="tabs-container">
      <div
        class="tab-button"
        :class="{ active: activeTab === 'online' }"
        @click="activeTab = 'online'"
      >
        <v-icon class="tab-icon">mdi-cellphone-wireless</v-icon>
        <span class="tab-text">Online Payments</span>
        <v-chip color="#002181" variant="flat" size="x-small" class="tab-badge">
          {{ onlineCount }}
        </v-chip>
      </div>
      <div
        class="tab-button"
        :class="{ active: activeTab === 'onsite' }"
        @click="activeTab = 'onsite'"
      >
        <v-icon class="tab-icon">mdi-cash-register</v-icon>
        <span class="tab-text">Onsite Payments</span>
        <v-chip color="#002181" variant="flat" size="x-small" class="tab-badge">
          {{ onsiteCount }}
        </v-chip>
      </div>
    </div>

    <div class="tab-content">
      <transition name="fade" mode="out-in">
        <OnlinePayments
          v-if="activeTab === 'online'"
          @accept-payment="handleAcceptPayment"
          @decline-payment="handleDeclinePayment"
        />
        <OnsitePayments
          v-else
          @payment-added="handlePaymentAdded"
          @delete-payment="handleDeletePayment"
        />
      </transition>
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top right"
    >
      <div class="d-flex align-center gap-2">
        <v-icon>{{ snackbarIcon }}</v-icon>
        <span>{{ snackbarMessage }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import OnlinePayments from '../OnlinePayments/OnlinePayments.vue'
import OnsitePayments from '../OnsitePayments/OnsitePayments.vue'

export default {
  name: 'StallPayments',
  components: {
    OnlinePayments,
    OnsitePayments
  },
  data() {
    return {
      activeTab: 'online',
      onlineCount: 5,
      onsiteCount: 3,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      snackbarIcon: 'mdi-check-circle'
    }
  },
  methods: {
    handleAcceptPayment(payment) {
      console.log('Accepting payment:', payment)
      this.showNotification('Payment accepted successfully!', 'success', 'mdi-check-circle')
      this.onlineCount--
      // Here you would typically make an API call to update the payment status
    },
    handleDeclinePayment(payment) {
      console.log('Declining payment:', payment)
      this.showNotification('Payment declined', 'error', 'mdi-close-circle')
      this.onlineCount--
      // Here you would typically make an API call to update the payment status
    },
    handlePaymentAdded(payment) {
      console.log('Payment added:', payment)
      this.showNotification('Onsite payment added successfully!', 'success', 'mdi-check-circle')
      this.onsiteCount++
      // Here you would typically make an API call to save the payment
    },
    handleDeletePayment(payment) {
      console.log('Deleting payment:', payment)
      this.showNotification('Payment deleted', 'info', 'mdi-information')
      this.onsiteCount--
      // Here you would typically make an API call to delete the payment
    },
    showNotification(message, color, icon) {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.snackbarIcon = icon
      this.showSnackbar = true
    }
  }
}
</script>

<style scoped>
.stall-payments {
  width: 100%;
}

.tabs-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 15px;
  color: #6b7280;
}

.tab-button:hover {
  background: #f9fafb;
}

.tab-button.active {
  background: #002181;
  color: white;
  border-color: #002181;
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.2);
}

.tab-icon {
  font-size: 24px;
}

.tab-button.active .tab-icon {
  color: white;
}

.tab-text {
  font-size: 16px;
}

.tab-badge {
  margin-left: auto;
}

.tab-button.active .tab-badge {
  background: white !important;
  color: #002181 !important;
}

.tab-content {
  position: relative;
  min-height: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .tabs-container {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    padding: 14px 20px;
  }
  
  .tab-text {
    font-size: 14px;
  }
}
</style>
