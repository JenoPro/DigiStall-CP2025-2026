import CardStallsComponent from '../Stalls/StallsComponents/CardStallsComponent/CardStallsComponent.vue'
import SearchFilter from '../Stalls/StallsComponents/SearchAndFilter/SearchAndFilter.vue'
import AddChoiceModal from './StallsComponents/ChoicesModal/AddChoiceModal/AddChoiceModal.vue'
import EditStall from '../Stalls/StallsComponents/EditStall/EditStall.vue'
import ErrorPopup from '../../Common/ErrorPopup/ErrorPopup.vue'

export default {
  name: 'Stalls',
  components: {
    CardStallsComponent,
    SearchFilter,
    AddChoiceModal,
    EditStall,
    ErrorPopup,
  },
  data() {
    return {
      pageTitle: 'Stalls',
      showModal: false,
      showEditModal: false,
      selectedStall: {},
      stallsData: [],
      displayStalls: [],
      loading: false,
      error: null,
      // API configuration
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      // Current user info
      currentUser: null,
      // Floor/Section availability check
      hasFloorsSections: true,
      // Warning container dialog
      showWarningContainer: false,
      warningData: {
        title: '',
        message: '',
        type: 'primary'
      },
      // Custom popup for notifications
      popup: {
        show: false,
        message: '',
        type: 'error', // error, success, warning, info, primary
      },
    }
  },

  async mounted() {
    await this.initializeComponent()
  },

  methods: {
    // Initialize component with user auth check
    async initializeComponent() {
      try {
        // Check authentication first
        const token = sessionStorage.getItem('authToken')
        const user = sessionStorage.getItem('currentUser')

        if (!token || !user) {
          this.showMessage('Please login to access stalls', 'error')
          this.$router.push('/login')
          return
        }

        // Validate token format - JWT tokens have 3 parts separated by dots
        if (token && !this.isValidJWTFormat(token)) {
          console.warn('⚠️ Invalid token format detected - but continuing for debugging')
          console.warn('   - Token:', token)
          console.warn('   - Token length:', token?.length)
          console.warn('   - Expected JWT format with 3 parts separated by dots')
          // Temporarily allow non-JWT tokens for debugging
          // this.clearAuthAndRedirect()
          // this.showMessage('Session expired. Please login again.', 'warning')
          // return
        }

        // Check if user has permission to access stalls
        if (!this.checkStallsPermission()) {
          this.showMessage('Access denied. You do not have permission to view stalls.', 'error')
          this.$router.push('/dashboard')
          return
        }

        this.currentUser = JSON.parse(user)
        console.log('Current user:', this.currentUser)

        // Load stalls first - always allow viewing existing stalls
        await this.fetchStalls()

        // For branch managers, check floors and sections availability for adding new stalls
        // But don't block access to viewing existing stalls
        if (this.currentUser.userType === 'branch_manager') {
          this.hasFloorsSections = await this.checkFloorsAndSections()
          if (!this.hasFloorsSections) {
            console.log('⚠️ No floors/sections available - will show warning when trying to add stalls')
          }
        }
      } catch (error) {
        console.error('Error initializing component:', error)
        this.showMessage('Error initializing stalls page', 'error')
      }
    },

    // Fetch stalls from backend API with proper authentication
    async fetchStalls() {
      this.loading = true
      this.error = null

      try {
        console.log('Fetching stalls from:', `${this.apiBaseUrl}/stalls`)

        // Get token from sessionStorage (where login stores it)
        const token = sessionStorage.getItem('authToken')

        if (!token) {
          throw new Error('Authentication token not found. Please login again.')
        }

        // Validate token format before making API call
        if (!this.isValidJWTFormat(token)) {
          console.warn(
            '⚠️ Invalid JWT token format detected in fetchStalls - but continuing for debugging',
          )
          console.warn('   - Token:', token)
          console.warn('   - Token length:', token?.length)
          // Temporarily allow non-JWT tokens for debugging
          // this.clearAuthAndRedirect()
          // throw new Error('Invalid session token. Please login again.')
        }

        console.log(
          '🔑 Making stalls API call with token:',
          token ? `${token.substring(0, 30)}...` : 'null',
        )
        console.log('🔑 Token length:', token?.length)
        console.log('🔑 Full token for debugging:', token)
        console.log('🔑 Is JWT format?', token?.includes('.') && token?.split('.').length === 3)

        const response = await fetch(`${this.apiBaseUrl}/stalls`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('📡 Stalls API response status:', response.status)
        console.log('📡 Stalls API response headers:', [...response.headers.entries()])

        if (!response.ok) {
          console.error('❌ Stalls API failed with status:', response.status)
          if (response.status === 401) {
            console.error('❌ 401 Unauthorized - Backend rejected the token')
            console.error('❌ This means either:')
            console.error('   1. Backend is still expecting old session token format')
            console.error('   2. Backend JWT verification is failing')
            console.error('   3. Backend auth middleware has issues')
            // Token expired or invalid - redirect to login
            this.clearAuthAndRedirect()
            throw new Error('Session expired. Please login again.')
          } else if (response.status === 403) {
            // Enhanced 403 error handling for employee permissions
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData.message || 'Access denied'

            console.error('❌ 403 Forbidden - Permission denied')
            console.error('❌ Error details:', errorMessage)
            console.error('❌ This means:')
            console.error('   1. Employee lacks required "stalls" permission')
            console.error('   2. Backend middleware is incorrectly configured')
            console.error('   3. Role-based access needs to be updated to permission-based')

            // Check if user has stalls permission
            const userPermissions = JSON.parse(
              sessionStorage.getItem('employeePermissions') || '[]',
            )
            console.error('👤 Current user permissions:', userPermissions)

            if (userPermissions.includes('stalls')) {
              console.error('⚠️  User HAS stalls permission - backend middleware issue!')
              throw new Error(
                'Permission error: You have stalls permission but backend is rejecting access. Contact administrator.',
              )
            } else {
              console.error('❌ User lacks stalls permission')
              throw new Error('Access denied: You do not have permission to view stalls.')
            }
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your authentication.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('API Response:', result)

        if (result.success) {
          // Transform backend data to match frontend format
          this.stallsData = result.data.map((stall) => this.transformStallData(stall))
          this.displayStalls = [...this.stallsData]

          console.log(`Successfully loaded ${this.stallsData.length} stalls for branch manager`)
          console.log('Transformed stalls data:', this.stallsData)
        } else {
          throw new Error(result.message || 'Failed to fetch stalls')
        }
      } catch (error) {
        console.error('Error fetching stalls:', error)
        this.error = error.message

        // Show error message
        this.showMessage(`Failed to load stalls: ${error.message}`, 'error')

        // If it's an auth error, clear session and redirect
        if (error.message.includes('login') || error.message.includes('Session expired')) {
          this.clearAuthAndRedirect()
        }
      } finally {
        this.loading = false
      }
    },

    // Check if floors and sections are available for branch manager
    async checkFloorsAndSections() {
      try {
        const token = sessionStorage.getItem('authToken')
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`

        console.log('Checking floors and sections availability...')

        // Check for floors
        const floorsResponse = await fetch(`${apiBaseUrl}/branches/floors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        // Check for sections
        const sectionsResponse = await fetch(`${apiBaseUrl}/branches/sections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!floorsResponse.ok || !sectionsResponse.ok) {
          console.error('Error checking floors/sections:', floorsResponse.status, sectionsResponse.status)
          return false
        }

        const floorsData = await floorsResponse.json()
        const sectionsData = await sectionsResponse.json()

        const hasFloors = floorsData.success && floorsData.data && floorsData.data.length > 0
        const hasSections = sectionsData.success && sectionsData.data && sectionsData.data.length > 0

        console.log('Floors/Sections check:', { hasFloors, hasSections })
        console.log('Floors data:', floorsData.data?.length || 0, 'items')
        console.log('Sections data:', sectionsData.data?.length || 0, 'items')

        return hasFloors && hasSections
      } catch (error) {
        console.error('Error checking floors and sections:', error)
        return false
      }
    },

    transformStallData(stall) {
      console.log('🔄 Transforming stall data:', stall)

      const extractedId = stall.stall_id || stall.id || stall.ID

      return {
        // Basic stall info
        id: extractedId,
        stallNumber: stall.stall_no || stall.stallNumber,
        price: this.formatPrice(stall.rental_price || stall.price),
        location: stall.stall_location,
        size: stall.size,
        dimensions: stall.dimensions,
        description: stall.description,
        status: stall.status,
        stamp: stall.stamp,
        createdAt: stall.created_at,
        isAvailable: Boolean(stall.is_available),

        // ⭐ FIX: Add BOTH naming conventions for compatibility
        // Snake_case (for filter component)
        floor_id: stall.floor_id,
        floor_name: stall.floor_name,
        floor_number: stall.floor_number,
        section_id: stall.section_id,
        section_name: stall.section_name,
        section_code: stall.section_code,

        // CamelCase (for other components)
        floorId: stall.floor_id,
        floorName: stall.floor_name,
        floorNumber: stall.floor_number,
        sectionId: stall.section_id,
        sectionName: stall.section_name,
        sectionCode: stall.section_code,

        // Legacy fields for backward compatibility
        floor: stall.floor_name || `Floor ${stall.floor_number}`,
        section: stall.section_name,
        priceType: stall.price_type || 'Fixed Price',
        price_type: stall.price_type || 'Fixed Price',

        // Image
        image: stall.stall_image || this.getDefaultImage(stall.section_name),

        // Manager info
        managerName:
          stall.manager_first_name && stall.manager_last_name
            ? `${stall.manager_first_name} ${stall.manager_last_name}`
            : 'Unknown Manager',
        area: stall.area,
        branchLocation: stall.location,

        // Keep original values
        rentalPrice: stall.rental_price,
        rental_price: stall.rental_price,
        originalData: stall,
      }
    },

    // Format price display
    formatPrice(price) {
      return `₱${parseFloat(price).toLocaleString()}`
    },

    // Get default image based on section from database
    getDefaultImage(section) {
      const defaultImages = {
        // Match the sections from your database/form
        'Grocery Section': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'Meat Section': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        'Fresh Produce': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        'Clothing Section': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        'Electronics Section': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'Food Court': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',

        // Default fallback
        default: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      }

      console.log(`Getting image for section: "${section}"`)
      return defaultImages[section] || defaultImages['default']
    },

    // Check if user has permission to access stalls
    checkStallsPermission() {
      const userType = sessionStorage.getItem('userType')

      // Admins and branch managers always have access (check both formats)
      if (userType === 'admin' || userType === 'branch-manager' || userType === 'branch_manager') {
        return true
      }

      // For employees, check specific permissions - NEW FORMAT (object)
      if (userType === 'employee') {
        // Try new format first (object with permissions)
        const permissions = JSON.parse(sessionStorage.getItem('permissions') || '{}')
        if (permissions.stalls === true) {
          return true
        }

        // Fallback to old format (array)
        const employeePermissions = JSON.parse(
          sessionStorage.getItem('employeePermissions') || '[]',
        )
        return employeePermissions.includes('stalls') || employeePermissions.stalls === true
      }

      return false
    },

    // Clear authentication and redirect to login
    clearAuthAndRedirect() {
      // Clear all authentication data - COMPREHENSIVE CLEANUP
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('currentUser')
      sessionStorage.removeItem('userType')
      sessionStorage.removeItem('branchManagerId')
      sessionStorage.removeItem('employeeId')
      sessionStorage.removeItem('employeeData')
      sessionStorage.removeItem('employeePermissions')
      sessionStorage.removeItem('permissions')
      sessionStorage.removeItem('userRole')
      sessionStorage.removeItem('branchId')
      sessionStorage.removeItem('fullName')
      sessionStorage.removeItem('adminId')
      sessionStorage.removeItem('adminData')

      console.log('🧹 Session cleared due to authentication error')

      setTimeout(() => {
        this.$router.push('/login')
      }, 2000)
    },

    // Validate JWT token format (should have 3 parts separated by dots)
    isValidJWTFormat(token) {
      if (!token || typeof token !== 'string') return false

      const parts = token.split('.')
      return parts.length === 3 && parts.every((part) => part.length > 0)
    },

    // Refresh stalls data
    async refreshStalls() {
      await this.fetchStalls()
    },

    // Edit stall functions
    handleStallEdit(stall) {
      console.log('🔧 Opening edit modal for stall:', stall)
      console.log('🔧 Stall ID in object:', stall.id)

      this.selectedStall = { ...stall }
      console.log('🔧 Selected stall set to:', this.selectedStall)

      this.showEditModal = true
    },

    async handleStallUpdated(updatedStallData) {
      try {
        console.log('🔄 Parent received stall update (raw backend data):', updatedStallData)

        // Transform the raw backend data using the same method used for initial load
        const updatedStall = this.transformStallData(updatedStallData)
        console.log('🔄 Transformed stall data:', updatedStall)

        console.log('🔄 Looking for stall with ID:', updatedStall.id)
        console.log(
          '🔄 Current stallsData IDs:',
          this.stallsData.map((s) => ({ id: s.id, stallNumber: s.stallNumber })),
        )

        // Update local data
        const index = this.stallsData.findIndex((s) => s.id === updatedStall.id)
        console.log('🔄 Found stall at index:', index)

        if (index > -1) {
          console.log('🔄 Old stall data:', this.stallsData[index])
          this.stallsData[index] = { ...updatedStall }
          console.log('🔄 New stall data:', this.stallsData[index])

          this.displayStalls = [...this.stallsData]
          console.log('✅ Local stall data updated successfully!')

          // No additional success message - EditStall component handles the popup
        } else {
          console.error('❌ Could not find stall to update in local data')
        }

        this.closeEditModal()
      } catch (error) {
        console.error('Error handling stall update:', error)
        this.showMessage('Error updating stall display', 'error')
      }
    },

    closeEditModal() {
      this.showEditModal = false
      this.selectedStall = {}
    },

    async handleStallDeleted(stallId) {
      try {
        console.log('Processing stall deletion for ID:', stallId)

        // Remove from local data
        const index = this.stallsData.findIndex((s) => s.id === stallId)
        if (index > -1) {
          const deletedStall = this.stallsData[index]
          this.stallsData.splice(index, 1)
          this.displayStalls = [...this.stallsData]

          console.log(`Stall "${deletedStall.stallNumber}" removed from local data`)
        } else {
          console.warn('Stall not found in local data for deletion')
        }
      } catch (error) {
        console.error('Error handling stall deletion:', error)
        this.showMessage('Error removing stall from display', 'error')
      }
    },

    // Search and filter functions
    handleFilteredStalls(filtered) {
      this.displayStalls = filtered
    },

    // Handle Floating Action Button click
    async handleFabClick() {
      console.log('🎯 FAB clicked - checking floors and sections availability')
      console.log('🎯 Current user type:', this.currentUser?.userType)
      console.log('🎯 Has floors and sections:', this.hasFloorsSections)

      // Check if floors and sections are available
      if (!this.hasFloorsSections) {
        console.log('🎯 No floors/sections - showing warning message')
        this.showMessage('Please set up floors and sections first before adding stalls.', 'primary')
      } else {
        console.log('🎯 Floors/sections exist - showing choice modal')
        this.showModal = true
      }
    },

    // Add stall functions
    async openAddStallModal() {
      // For branch managers, check if floors and sections are available before allowing stall creation
      if (this.currentUser?.userType === 'branch_manager' && !this.hasFloorsSections) {
        this.showMessage('Please set up floors and sections first before adding stalls.', 'primary')
        return
      }
      this.showModal = true
    },

    closeAddStallModal() {
      this.showModal = false
    },

    // UPDATED: Handle stall added with proper event name
    async handleStallAdded(newStallData) {
      try {
        console.log('🆕 Handling new stall data (from AddAvailableStall):', newStallData)
        console.log('🆕 Raw stall data type:', typeof newStallData)
        console.log('🆕 Raw stall data keys:', Object.keys(newStallData || {}))

        // Transform the new stall data and add to local array
        const transformedStall = this.transformStallData(newStallData)
        console.log('🆕 Transformed new stall:', transformedStall)
        console.log('🆕 Final stall ID:', transformedStall.id)

        this.stallsData.unshift(transformedStall) // Add to beginning
        this.displayStalls = [...this.stallsData]
        this.closeAddStallModal()
      } catch (error) {
        console.error('Error handling new stall:', error)
        this.showMessage('Error adding stall to display', 'error')
        // Refresh the entire list if there's an issue
        await this.fetchStalls()
      }
    },

    // Alternative handler method name (in case the emit uses different name)
    async onStallAdded(newStallData) {
      await this.handleStallAdded(newStallData)
    },

    // Handle floor added
    async handleFloorAdded(newFloorData) {
      try {
        console.log('Handling new floor data:', newFloorData)
      } catch (error) {
        console.error('Error handling new floor:', error)
        // Only show error messages
        this.showMessage('Error processing new floor', 'error')
      }
    },

    // Handle section added
    async handleSectionAdded(newSectionData) {
      try {
        console.log('Handling new section data:', newSectionData)
      } catch (error) {
        console.error('Error handling new section:', error)
        // Only show error messages
        this.showMessage('Error processing new section', 'error')
      }
    },

    // Handle refresh request from child components
    async onRefreshStalls() {
      await this.fetchStalls()
    },

    // Message handling with enhanced display options
    showMessage(text, color = 'success') {
      // Handle case where an object is passed instead of string
      const messageText = typeof text === 'string' ? text : JSON.stringify(text)

      // Map old color values to new popup types
      const typeMapping = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
        primary: 'primary',
        red: 'error',
        green: 'success',
        orange: 'warning',
        blue: 'info',
      }

      this.popup = {
        show: true,
        message: messageText,
        type: typeMapping[color] || 'error',
      }

      console.log(`Message (${color}): ${messageText}`)
    },

    // Modal event handlers
    handleEditModalClose() {
      this.closeEditModal()
    },

    handleEditError(errorMessage) {
      this.showMessage(errorMessage, 'error')
    },

    // Handle show-message events from child components
    handleShowMessage({ type, text }) {
      this.showMessage(text, type)
    },

    // Handle warning container request from AddChoiceModal
    handleShowWarningContainer(warningInfo) {
      console.log('🚨 Showing warning container:', warningInfo)
      this.warningData = {
        title: warningInfo.title || 'Information',
        message: warningInfo.message || '',
        type: warningInfo.type || 'primary'
      }
      this.showWarningContainer = true
    },

    // Close warning container and show choice modal
    closeWarningAndShowModal() {
      this.showWarningContainer = false
      // After closing warning, show the choice modal so user can add floors/sections
      this.showModal = true
    },

        // Debug helper - log current stall data
    debugStallData() {
      console.log('=== STALL DATA DEBUG ===')
      console.log('Total stalls:', this.stallsData.length)
      console.log('Display stalls:', this.displayStalls.length)
      console.log('Sample stall:', this.stallsData[0])
      console.log('Current user:', this.currentUser)
      console.log('========================')
    },

    // NEW: Handle raffle management
    handleRaffleManagement(stall) {
      console.log('Navigate to raffle management for stall:', stall)
      // Navigate to the raffles page with a specific stall focus
      this.$router.push({
        path: '/stalls/raffles',
        query: { stallId: stall.id, stallNumber: stall.stallNumber },
      })
    },

    // NEW: Handle auction management
    handleAuctionManagement(stall) {
      console.log('Navigate to auction management for stall:', stall)
      // Navigate to the auctions page with a specific stall focus
      this.$router.push({
        path: '/stalls/auctions',
        query: { stallId: stall.id, stallNumber: stall.stallNumber },
      })
    },

    // Error handling utilities
    async retryFetch() {
      await this.fetchStalls()
    },

    handleNetworkError(error) {
      if (error.message.includes('fetch')) {
        return 'Network connection failed. Please check your internet connection.'
      } else if (error.message.includes('500')) {
        return 'Server error. Please try again later.'
      } else if (error.message.includes('404')) {
        return 'API endpoint not found. Please check server configuration.'
      }
      return 'An unexpected error occurred. Please try again.'
    },

    // Authentication utilities
    async makeAuthenticatedRequest(url, options = {}) {
      const token = sessionStorage.getItem('token')
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      const requestOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      }

      try {
        const response = await fetch(url, requestOptions)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        console.error('API request failed:', error)
        throw error
      }
    },

    // Branch utilities
    getCurrentBranchInfo() {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
      return {
        branchId: currentUser.branchId || currentUser.branch_id,
        branchName: currentUser.branchName || currentUser.branch_name,
        userId: currentUser.id,
        userType: currentUser.userType,
      }
    },
  },

  // Computed properties
  computed: {
    hasStalls() {
      return this.stallsData && this.stallsData.length > 0
    },
  },

  // Watchers
  watch: {
    stallsData: {
      handler(newStalls) {
        // Update display stalls when main data changes
        if (this.displayStalls.length === 0 || this.displayStalls.length === newStalls.length) {
          this.displayStalls = [...newStalls]
        }

        // Debug log when stalls data changes
        console.log(`Stalls data updated: ${newStalls.length} stalls`)
      },
      deep: true,
    },

    displayStalls: {
      handler(newDisplayStalls) {
        console.log(`Display stalls updated: ${newDisplayStalls.length} stalls shown`)
      },
    },
  },

  // Lifecycle hooks
  beforeUnmount() {
    // Clear any timeouts or intervals if needed
    console.log('Stalls component unmounting')
  },

  // Error handling for component
  errorCaptured(err, instance, info) {
    console.error('Component error captured:', err, info)
    this.showMessage('A component error occurred. Please refresh the page.', 'error')
    return false
  },
}
