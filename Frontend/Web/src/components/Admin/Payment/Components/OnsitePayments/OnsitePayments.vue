<template>
  <div class="onsite-payments">
    <div class="section-header">
      <h3 class="section-title">
        <v-icon class="title-icon">mdi-cash-register</v-icon>
        Onsite Payments
      </h3>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by ID, name, receipt number..."
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        class="search-field"
      ></v-text-field>
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
                <th>Stall Number</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Collected By</th>
                <th>Receipt No.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="7" class="empty-state">
                  <v-icon size="48" color="grey">mdi-inbox</v-icon>
                  <p>No onsite payments recorded</p>
                </td>
              </tr>
              <tr 
                v-for="payment in filteredPayments" 
                :key="payment.id"
                class="clickable-row"
                @click="viewPayment(payment)"
              >
                <td class="id-cell">{{ payment.id }}</td>
                <td class="name-cell">
                  <div class="stallholder-info">
                    <div class="avatar">{{ payment.stallholderName.charAt(0) }}</div>
                    <span class="name">{{ payment.stallholderName }}</span>
                  </div>
                </td>
                <td class="stall-cell">
                  <v-chip color="#002181" variant="flat" size="small">
                    {{ payment.stallNo }}
                  </v-chip>
                </td>
                <td class="amount-cell">{{ formatCurrency(payment.amount) }}</td>
                <td class="date-cell">{{ formatDate(payment.paymentDate) }}</td>
                <td class="collector-cell">{{ payment.collectedBy }}</td>
                <td class="receipt-cell">{{ payment.receiptNo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>
    </div>

    <!-- Add Payment Modal -->
    <v-dialog v-model="showAddModal" max-width="700px" persistent>
      <v-card>
        <v-card-title class="modal-header">
          <span class="modal-title">Add Onsite Payment</span>
          <v-btn icon variant="text" @click="closeAddModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="addForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.stallholderName"
                  label="Stallholder Name"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                  prepend-inner-icon="mdi-account"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.stallNo"
                  label="Stall Number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                  prepend-inner-icon="mdi-store"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.amount"
                  label="Amount"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  :rules="[v => !!v || 'Required', v => v > 0 || 'Must be greater than 0']"
                  prepend-inner-icon="mdi-currency-php"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.paymentDate"
                  label="Payment Date"
                  variant="outlined"
                  density="comfortable"
                  type="date"
                  :rules="[v => !!v || 'Required']"
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.collectedBy"
                  label="Collected By"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                  prepend-inner-icon="mdi-account-tie"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.receiptNo"
                  label="Receipt Number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                  prepend-inner-icon="mdi-receipt"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  label="Notes (Optional)"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  prepend-inner-icon="mdi-note-text"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAddModal">Cancel</v-btn>
          <v-btn
            color="#002181"
            variant="flat"
            :disabled="!formValid"
            @click="addPayment"
          >
            <v-icon class="mr-1">mdi-check</v-icon>
            Add Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Payment Modal -->
    <v-dialog v-model="showViewModal" max-width="600px">
      <v-card>
        <v-card-title class="modal-header">
          <span class="modal-title">Payment Details</span>
          <v-btn icon variant="text" @click="showViewModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <div v-if="selectedPayment" class="payment-details">
            <div class="detail-group">
              <div class="detail-item">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">{{ selectedPayment.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stallholder Name:</span>
                <span class="detail-value">{{ selectedPayment.stallholderName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stall Number:</span>
                <span class="detail-value">{{ selectedPayment.stallNo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">{{ formatCurrency(selectedPayment.amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">{{ formatDate(selectedPayment.paymentDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Collected By:</span>
                <span class="detail-value">{{ selectedPayment.collectedBy }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Receipt Number:</span>
                <span class="detail-value">{{ selectedPayment.receiptNo }}</span>
              </div>
              <div v-if="selectedPayment.notes" class="detail-item full-width">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ selectedPayment.notes }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Floating Action Button -->
    <div class="fab-container">
      <button class="fab-button" @click="showAddModal = true">
        <div class="fab-icon">
          <v-icon color="white" size="28">mdi-plus</v-icon>
        </div>
        <div class="fab-ripple"></div>
        <div class="fab-ripple-2"></div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnsitePayments',
  data() {
    return {
      searchQuery: '',
      showAddModal: false,
      showViewModal: false,
      formValid: false,
      selectedPayment: null,
      form: {
        stallholderName: '',
        stallNo: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        collectedBy: '',
        receiptNo: '',
        notes: ''
      },
      onsitePayments: [
        {
          id: 'OS-001',
          stallholderName: 'Roberto Cruz',
          stallNo: 'E-12',
          amount: 5000,
          paymentDate: '2024-11-02',
          collectedBy: 'Admin Staff',
          receiptNo: 'RCP-2024110201',
          notes: 'Monthly rental payment'
        },
        {
          id: 'OS-002',
          stallholderName: 'Linda Aquino',
          stallNo: 'F-28',
          amount: 4500,
          paymentDate: '2024-11-01',
          collectedBy: 'Admin Staff',
          receiptNo: 'RCP-2024110102',
          notes: ''
        },
        {
          id: 'OS-003',
          stallholderName: 'Miguel Torres',
          stallNo: 'G-05',
          amount: 6000,
          paymentDate: '2024-10-31',
          collectedBy: 'Finance Officer',
          receiptNo: 'RCP-2024103103',
          notes: 'Advance payment for 2 months'
        }
      ]
    }
  },
  computed: {
    filteredPayments() {
      if (!this.searchQuery) {
        return this.onsitePayments;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.onsitePayments.filter(payment => 
        payment.id.toLowerCase().includes(query) ||
        payment.stallholderName.toLowerCase().includes(query) ||
        payment.stallNo.toLowerCase().includes(query) ||
        payment.receiptNo.toLowerCase().includes(query) ||
        payment.collectedBy.toLowerCase().includes(query)
      );
    }
  },
  methods: {
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
    closeAddModal() {
      this.showAddModal = false
      this.resetForm()
    },
    resetForm() {
      this.form = {
        stallholderName: '',
        stallNo: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        collectedBy: '',
        receiptNo: '',
        notes: ''
      }
      if (this.$refs.addForm) {
        this.$refs.addForm.reset()
      }
    },
    addPayment() {
      if (this.$refs.addForm.validate()) {
        const newPayment = {
          id: `OS-${String(this.onsitePayments.length + 1).padStart(3, '0')}`,
          stallholderName: this.form.stallholderName,
          stallNo: this.form.stallNo,
          amount: parseFloat(this.form.amount),
          paymentDate: this.form.paymentDate,
          collectedBy: this.form.collectedBy,
          receiptNo: this.form.receiptNo,
          notes: this.form.notes
        }
        this.onsitePayments.unshift(newPayment)
        this.$emit('payment-added', newPayment)
        this.closeAddModal()
      }
    },
    viewPayment(payment) {
      this.selectedPayment = payment
      this.showViewModal = true
    },
    deletePayment(payment) {
      this.$emit('delete-payment', payment)
    }
  }
}
</script>

<style scoped>
.onsite-payments {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
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
  background: #f0f4ff;
  transform: scale(1.01);
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

.name {
  font-weight: 600;
  color: #1a1a1a;
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

.modal-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-item.full-width {
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.detail-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
  text-align: right;
}

.detail-value.amount {
  color: #10b981;
  font-size: 16px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-value {
    text-align: left;
  }
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-button {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #002181;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 33, 129, 0.5);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.fab-ripple,
.fab-ripple-2 {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 33, 129, 0.3);
  transform: translate(-50%, -50%);
  animation: ripple 2s infinite ease-out;
  pointer-events: none;
}

.fab-ripple-2 {
  animation-delay: 1s;
}

@keyframes ripple {
  0% {
    width: 64px;
    height: 64px;
    opacity: 0.8;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

@media (max-width: 960px) {
  .table-wrapper {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .fab-container {
    bottom: 20px;
    right: 20px;
  }
  
  .fab-button {
    width: 56px;
    height: 56px;
  }
  
  .fab-ripple,
  .fab-ripple-2 {
    width: 56px;
    height: 56px;
  }
  
  @keyframes ripple {
    0% {
      width: 56px;
      height: 56px;
      opacity: 0.8;
    }
    100% {
      width: 100px;
      height: 100px;
      opacity: 0;
    }
  }
}
</style>
