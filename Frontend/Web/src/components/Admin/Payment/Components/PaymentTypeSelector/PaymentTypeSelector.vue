<template>
  <div class="payment-type-selector">
    <div class="selector-header">
      <h2 class="selector-title">Payment Management</h2>
      <div class="dropdown-container" ref="dropdownRef">
        <div class="selected-type" @click="toggleDropdown">
          <span class="type-text">{{ selectedTypeLabel }}</span>
          <v-icon :class="{ 'rotated': showDropdown }">mdi-chevron-down</v-icon>
        </div>
        
        <transition name="dropdown-fade">
          <div v-if="showDropdown" class="dropdown-menu">
            <div
              v-for="type in paymentTypes"
              :key="type.value"
              class="dropdown-item"
              :class="{ active: selectedType === type.value }"
              @click="selectType(type)"
            >
              <v-icon class="item-icon">{{ type.icon }}</v-icon>
              <span>{{ type.label }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentTypeSelector',
  props: {
    selectedType: {
      type: String,
      default: 'stall'
    }
  },
  data() {
    return {
      showDropdown: false,
      paymentTypes: [
        { value: 'stall', label: 'Stall Applicants', icon: 'mdi-store' },
        { value: 'vendor', label: 'Vendor Applicants', icon: 'mdi-account-tie' }
      ]
    }
  },
  computed: {
    selectedTypeLabel() {
      const type = this.paymentTypes.find(t => t.value === this.selectedType)
      return type ? type.label : 'Stall Applicants'
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    selectType(type) {
      this.$emit('update:selectedType', type.value)
      this.showDropdown = false
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.dropdownRef
      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    }
  }
}
</script>

<style scoped>
.payment-type-selector {
  margin-bottom: 24px;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.selector-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.dropdown-container {
  position: relative;
  min-width: 250px;
}

.selected-type {
  background: white;
  border: 2px solid #002181;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-type:hover {
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 33, 129, 0.1);
}

.type-text {
  font-size: 16px;
  font-weight: 600;
  color: #002181;
}

.selected-type .v-icon {
  color: #002181;
  transition: transform 0.3s ease;
}

.selected-type .v-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #002181;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 33, 129, 0.15);
  z-index: 1000;
}

.dropdown-item {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.dropdown-item:hover {
  background: #f0f4ff;
}

.dropdown-item.active {
  background: #002181;
  color: white;
}

.dropdown-item .item-icon {
  font-size: 20px;
}

.dropdown-item.active .item-icon {
  color: white;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .selector-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selector-title {
    font-size: 24px;
  }
  
  .dropdown-container {
    width: 100%;
  }
}
</style>
