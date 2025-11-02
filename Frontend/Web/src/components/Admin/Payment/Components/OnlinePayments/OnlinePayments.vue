<template>
  <div class="online-payments">
    <div class="section-header">
      <h3 class="section-title">
        <v-icon class="title-icon">mdi-cellphone-wireless</v-icon>
        Online Payments
      </h3>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by ID, name, reference number..."
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        class="search-field"
      ></v-text-field>
    </div>

    <!-- Payment Method Tabs -->
    <div class="payment-tabs">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="tab-item"
        :class="{ active: selectedMethod === method.id }"
        @click="selectedMethod = method.id"
      >
        <div class="tab-content">
          <div class="method-icon" :style="{ backgroundColor: method.color }">
            <v-icon color="white">{{ method.icon }}</v-icon>
          </div>
          <div class="tab-info">
            <span class="tab-label">{{ method.name }}</span>
            <span class="tab-count">{{ getMethodCount(method.id) }}</span>
          </div>
        </div>
      </div>
      <div
        class="tab-item"
        :class="{ active: selectedMethod === 'all' }"
        @click="selectedMethod = 'all'"
      >
        <div class="tab-content">
          <div class="method-icon" style="background-color: #002181">
            <v-icon color="white">mdi-view-grid</v-icon>
          </div>
          <div class="tab-info">
            <span class="tab-label">All</span>
            <span class="tab-count">{{ onlinePayments.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="payments-table-container">
      <v-card class="payments-card" elevation="0">
        <div class="table-wrapper">
          <table class="payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stallholder Name</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Reference No.</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="7" class="empty-state">
                  <v-icon size="48" color="grey">mdi-inbox</v-icon>
                  <p>No payments found</p>
                </td>
              </tr>
              <tr 
                v-for="payment in filteredPayments" 
                :key="payment.id"
                class="clickable-row"
              >
                <td class="id-cell" @click="viewPaymentDetails(payment)">{{ payment.id }}</td>
                <td class="name-cell" @click="viewPaymentDetails(payment)">
                  <div class="stallholder-info">
                    <div class="avatar">{{ payment.stallholderName.charAt(0) }}</div>
                    <div class="name-details">
                      <span class="name">{{ payment.stallholderName }}</span>
                      <span class="stall-no">Stall #{{ payment.stallNo }}</span>
                    </div>
                  </div>
                </td>
                <td @click="viewPaymentDetails(payment)">
                  <v-chip
                    :color="getMethodColor(payment.method)"
                    variant="flat"
                    size="small"
                  >
                    {{ payment.method }}
                  </v-chip>
                </td>
                <td class="amount-cell" @click="viewPaymentDetails(payment)">{{ formatCurrency(payment.amount) }}</td>
                <td class="reference-cell" @click="viewPaymentDetails(payment)">{{ payment.referenceNo }}</td>
                <td class="date-cell" @click="viewPaymentDetails(payment)">{{ formatDate(payment.date) }}</td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button class="table-action-btn accept-btn" @click.stop="acceptPayment(payment)">
                      ACCEPT
                    </button>
                    <button class="table-action-btn decline-btn" @click.stop="declinePayment(payment)">
                      DECLINE
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>
    </div>

    <!-- Payment Details Modal -->
    <v-dialog v-model="showDetailsModal" max-width="900px">
      <v-card>
        <v-card-title class="modal-header">
          <span class="modal-title">Payment Details</span>
          <v-btn icon variant="text" @click="showDetailsModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <div v-if="selectedPayment" class="payment-details">
            <v-row>
              <!-- Left Column: Payment Info -->
              <v-col cols="12" md="6">
                <div class="info-section">
                  <h4 class="section-subtitle">Payment Information</h4>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">Payment ID:</span>
                      <span class="info-value">{{ selectedPayment.id }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Stallholder Name:</span>
                      <span class="info-value">{{ selectedPayment.stallholderName }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Stall Number:</span>
                      <span class="info-value">{{ selectedPayment.stallNo }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Payment Method:</span>
                      <v-chip
                        :color="getMethodColor(selectedPayment.method)"
                        variant="flat"
                        size="small"
                      >
                        {{ selectedPayment.method }}
                      </v-chip>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Amount:</span>
                      <span class="info-value amount-highlight">{{ formatCurrency(selectedPayment.amount) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Reference Number:</span>
                      <span class="info-value">{{ selectedPayment.referenceNo }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Payment Date:</span>
                      <span class="info-value">{{ formatDate(selectedPayment.date) }}</span>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Right Column: Screenshot -->
              <v-col cols="12" md="6">
                <div class="screenshot-section">
                  <h4 class="section-subtitle">Payment Screenshot</h4>
                  <div class="screenshot-image">
                    <img :src="selectedPayment.screenshot" alt="Payment Screenshot" />
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDetailsModal = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'OnlinePayments',
  data() {
    return {
      searchQuery: '',
      selectedMethod: 'all',
      showDetailsModal: false,
      selectedPayment: null,
      paymentMethods: [
        { id: 'gcash', name: 'GCash', color: '#007DFE', icon: 'mdi-wallet' },
        { id: 'maya', name: 'Maya', color: '#00D632', icon: 'mdi-credit-card' },
        { id: 'bank', name: 'Bank Transfer', color: '#FF6B35', icon: 'mdi-bank' }
      ],
      onlinePayments: [
        {
          id: 'OP-001',
          stallholderName: 'Juan Dela Cruz',
          stallNo: 'A-15',
          method: 'GCash',
          amount: 5000,
          referenceNo: 'GC2024110201',
          date: '2024-11-02',
          screenshot: 'https://via.placeholder.com/400x600/007DFE/FFFFFF?text=GCash+Receipt'
        },
        {
          id: 'OP-002',
          stallholderName: 'Maria Santos',
          stallNo: 'B-23',
          method: 'Maya',
          amount: 4500,
          referenceNo: 'MY2024110202',
          date: '2024-11-02',
          screenshot: 'https://via.placeholder.com/400x600/00D632/FFFFFF?text=Maya+Receipt'
        },
        {
          id: 'OP-003',
          stallholderName: 'Pedro Reyes',
          stallNo: 'C-08',
          method: 'Bank Transfer',
          amount: 6000,
          referenceNo: 'BT2024110203',
          date: '2024-11-01',
          screenshot: 'https://via.placeholder.com/400x600/FF6B35/FFFFFF?text=Bank+Receipt'
        },
        {
          id: 'OP-004',
          stallholderName: 'Ana Garcia',
          stallNo: 'A-42',
          method: 'GCash',
          amount: 5500,
          referenceNo: 'GC2024110204',
          date: '2024-11-01',
          screenshot: 'https://via.placeholder.com/400x600/007DFE/FFFFFF?text=GCash+Receipt'
        },
        {
          id: 'OP-005',
          stallholderName: 'Carlos Mendoza',
          stallNo: 'D-17',
          method: 'Maya',
          amount: 4800,
          referenceNo: 'MY2024110205',
          date: '2024-10-31',
          screenshot: 'https://via.placeholder.com/400x600/00D632/FFFFFF?text=Maya+Receipt'
        }
      ]
    }
  },
  computed: {
    filteredPayments() {
      let payments = this.onlinePayments;
      
      // Filter by payment method
      if (this.selectedMethod !== 'all') {
        payments = payments.filter(payment => {
          const method = payment.method.toLowerCase().replace(/\s+/g, '');
          const selectedMethodNormalized = this.selectedMethod.toLowerCase().replace(/\s+/g, '');
          return method === selectedMethodNormalized || method.includes(selectedMethodNormalized);
        });
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        payments = payments.filter(payment => 
          payment.id.toLowerCase().includes(query) ||
          payment.stallholderName.toLowerCase().includes(query) ||
          payment.referenceNo.toLowerCase().includes(query) ||
          payment.stallNo.toLowerCase().includes(query) ||
          payment.method.toLowerCase().includes(query)
        );
      }
      
      return payments;
    }
  },
  methods: {
    getMethodCount(methodId) {
      return this.onlinePayments.filter(payment => {
        const method = payment.method.toLowerCase().replace(/\s+/g, '');
        const selectedMethodNormalized = methodId.toLowerCase().replace(/\s+/g, '');
        return method === selectedMethodNormalized || method.includes(selectedMethodNormalized);
      }).length;
    },
    getMethodColor(method) {
      const colors = {
        'GCash': '#007DFE',
        'Maya': '#00D632',
        'Bank Transfer': '#FF6B35'
      }
      return colors[method] || '#002181'
    },
    formatCurrency(amount) {
      return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    },
    viewPaymentDetails(payment) {
      this.selectedPayment = payment
      this.showDetailsModal = true
    },
    acceptPayment(payment) {
      this.$emit('accept-payment', payment)
      this.showDetailsModal = false
    },
    declinePayment(payment) {
      this.$emit('decline-payment', payment)
      this.showDetailsModal = false
    }
  }
}
</script>

<style scoped>
.online-payments {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 24px;
  padding: 0 2px;
}

.search-field {
  max-width: 500px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.title-icon {
  color: #002181;
  font-size: 28px;
}

.header-info {
  display: flex;
  gap: 8px;
}

.payment-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tab-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item:hover {
  border-color: #002181;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.1);
}

.tab-item.active {
  border-color: #002181;
  background: #f0f4ff;
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.15);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.tab-count {
  font-size: 13px;
  color: #6b7280;
}

.payments-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.payments-card {
  border: 2px solid #e5e7eb;
}

.table-wrapper {
  width: 100%;
  overflow-x: visible;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.payments-table thead {
  background: #002181;
}

.payments-table th {
  padding: 16px 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.payments-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background: #f9fafb;
}

.clickable-row td:not(.actions-cell) {
  cursor: pointer;
}

.payments-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #374151;
}

.id-cell {
  font-weight: 600;
  color: #002181;
}

.name-cell .stallholder-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #002181;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.name-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-weight: 600;
  color: #1a1a1a;
}

.stall-no {
  font-size: 12px;
  color: #6b7280;
}

.amount-cell {
  font-weight: 700;
  color: #10b981;
}

.receipt-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #6b7280;
}

.actions-cell {
  padding: 12px !important;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.table-action-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  white-space: nowrap;
}

.table-action-btn.accept-btn {
  background: #002181;
  color: white;
}

.table-action-btn.accept-btn:hover {
  background: #001557;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.3);
}

.table-action-btn.decline-btn {
  background: white;
  color: #002181;
  border: 2px solid #002181;
}

.table-action-btn.decline-btn:hover {
  background: #002181;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.3);
}

.empty-state {
  text-align: center;
  padding: 48px 24px !important;
}

.empty-state p {
  margin-top: 12px;
  color: #6b7280;
  font-size: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #002181;
  color: white;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
}

.payment-details {
  width: 100%;
}

.info-section {
  height: 100%;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #002181;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #002181;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
}

.amount-highlight {
  color: #10b981;
  font-size: 18px;
  font-weight: 700;
}

.screenshot-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.screenshot-image {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.screenshot-image img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 500px;
  object-fit: contain;
}

.modal-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 960px) {
  .table-wrapper {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .payment-tabs {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .table-action-btn {
    padding: 6px 16px;
    font-size: 11px;
  }
  
  .screenshot-image img {
    max-height: 300px;
  }
}
</style>
