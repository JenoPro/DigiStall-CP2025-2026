import AuctionCard from '../AuctionCard/AuctionCard.vue'
import SearchAndFilter from '../SearchAndFilter/SearchAndFilter.vue'

import participantsService from '../../../../../services/participantsService.js'

export default {
  name: 'ActiveAuctions',
  components: {
    AuctionCard,
    SearchAndFilter,
  },
  data() {
    return {
      auctions: [],
      filteredAuctions: [], // Will be populated by the SearchAndFilter component
      loading: false,
      search: '',
      statusFilter: null,
      sortBy: 'created_desc',
      showFilterPanel: false,

      // Dialog states
      showExtendDialog: false,
      showWinnerDialog: false,
      selectedAuction: null,
      extensionHours: 24,
      extending: false,
      selectingWinner: false,

      // Options
      statusOptions: [
        { text: 'Active (Accepting Bids)', value: 'active' },
        { text: 'Expiring Soon', value: 'expiring' },
        { text: 'Needs Winner Selection', value: 'expired' },
      ],
      sortOptions: [
        { text: 'Newest First', value: 'created_desc' },
        { text: 'Oldest First', value: 'created_asc' },
        { text: 'Expiring Soon', value: 'expires_asc' },
        { text: 'Highest Bid', value: 'bid_desc' },
        { text: 'Most Bidders', value: 'bidders_desc' },
      ],

      // Validation rules
      rules: {
        required: (value) => !!value || 'Required field',
        positiveNumber: (value) => value > 0 || 'Must be greater than 0',
        maxExtension: (value) => value <= 168 || 'Cannot extend more than 7 days (168 hours)',
      },

      // API base URL
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

      // Auto refresh interval
      refreshInterval: null,
    }
  },

  computed: {
    activeAuctions() {
      // Return auctions data for the SearchAndFilter component
      return this.auctions.map((auction) => ({
        ...auction,
        stallNumber: auction.stall_number,
        location: auction.location || '',
        floor_id: auction.floor_id,
        floor_name: auction.floor_name,
        section_id: auction.section_id,
        section_name: auction.section_name,
        status: this.getAuctionStatus(auction),
        startingPrice: auction.starting_price,
        currentBid: auction.current_highest_bid,
        endTime: auction.expires_at,
      }))
    },
  },

  mounted() {
    this.loadAuctions()

    // Check if we're focusing on a specific stall
    const { stallId, stallNumber } = this.$route.query
    if (stallId && stallNumber) {
      this.search = stallNumber
      this.$emit('show-message', `Showing auctions for stall ${stallNumber}`, 'info')
    }

    // Set up auto refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadAuctions(false) // Silent refresh
    }, 30000)
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    // Filter methods
    toggleFilter() {
      this.showFilterPanel = !this.showFilterPanel
    },

    applyFilters() {
      // Filters are applied automatically through computed property
      this.showFilterPanel = false
      this.$emit('show-message', 'Filters applied successfully', 'success')
    },

    clearFilters() {
      this.statusFilter = null
      this.search = ''
      this.sortBy = 'created_desc'
      this.showFilterPanel = false
      this.$emit('show-message', 'Filters cleared', 'info')
    },

    // New method to handle filtered auctions from SearchAndFilter component
    handleFilteredAuctions(filteredAuctions) {
      this.filteredAuctions = filteredAuctions
    },

    // Helper method to get auction status
    getAuctionStatus(auction) {
      const now = new Date()
      const expiresAt = new Date(auction.expires_at)
      const timeLeft = expiresAt - now
      const hoursLeft = timeLeft / (1000 * 60 * 60)

      if (auction.status === 'ended' || auction.status === 'completed') {
        return 'Ended'
      } else if (hoursLeft <= 0) {
        return 'Ended'
      } else if (hoursLeft <= 2) {
        return 'Active' // Expiring soon but still active
      } else {
        return 'Active'
      }
    },

    async loadAuctions(showLoading = true) {
      if (showLoading) this.loading = true

      try {
        const token = sessionStorage.getItem('authToken')
        if (!token) {
          this.$emit('show-message', 'Authentication required', 'error')
          return
        }

        const response = await fetch(
          `${this.apiBaseUrl}/stalls/auctions/active`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Auction API Response:', result)
        if (result.success) {
          // Map stalls data to auction format and filter for actual auctions only
          const allStalls = result.data || []
          console.log('All stalls received:', allStalls)
          console.log('Filtering for price_type=Auction, is_available=1')

          this.auctions = allStalls
            .filter((stall) => {
              console.log(
                `Stall ${stall.stall_no}: price_type=${stall.price_type}, is_available=${stall.is_available}`,
              )
              // Show all auction stalls regardless of availability status (admin view)
              return stall.price_type === 'Auction'
            })
            .map((stall) => {
              // Calculate expires_at based on created_at + durationHours
              let expiresAt = stall.expires_at
              if (!expiresAt && stall.created_at && stall.duration_hours) {
                const createdDate = new Date(stall.created_at)
                createdDate.setHours(createdDate.getHours() + parseInt(stall.duration_hours || 72))
                expiresAt = createdDate.toISOString()
              } else if (!expiresAt) {
                // Default 72 hours (3 days) from creation
                const createdDate = new Date(stall.created_at || Date.now())
                createdDate.setHours(createdDate.getHours() + 72)
                expiresAt = createdDate.toISOString()
              }

              return {
                auction_id: stall.stall_id,
                stall_id: stall.stall_id,
                id: stall.stall_id, // Add id for router navigation
                stall_number: stall.stall_no || stall.stall_number,
                location: stall.stall_location || stall.location,
                starting_bid: stall.rental_price,
                current_bid: stall.rental_price, // Will be updated from bidders data
                expires_at: expiresAt,
                created_at: stall.created_at,
                duration_hours: stall.duration_hours || 72,
                status: stall.status?.toLowerCase() || 'active',
                bid_count: 0, // Will be loaded from participants service
                bidder_count: 0, // Will be loaded from participants service
                floor_name: stall.floor_name,
                section_name: stall.section_name,
                recent_bids: [], // Will be loaded from participants service
                highest_bidder: null, // Will be loaded from participants service
              }
            })

          // Load bidders for each auction
          await this.loadBiddersForAuctions(this.auctions)

          console.log('Filtered auctions:', this.auctions)
        } else {
          throw new Error(result.message || 'Failed to load auctions')
        }
      } catch (error) {
        console.error('Error loading auctions:', error)
        this.$emit('show-message', `Failed to load auctions: ${error.message}`, 'error')
      } finally {
        if (showLoading) this.loading = false
      }
    },

    handleExtendTimer(auction) {
      this.selectedAuction = auction
      this.extensionHours = 24
      this.showExtendDialog = true
    },

    closeExtendDialog() {
      this.showExtendDialog = false
      this.selectedAuction = null
      this.extensionHours = 24
    },

    async confirmExtendTimer() {
      if (!this.selectedAuction || !this.extensionHours) return

      this.extending = true
      try {
        const token = sessionStorage.getItem('authToken')
        const response = await fetch(
          `${this.apiBaseUrl}/api/auctions/${this.selectedAuction.auction_id}/extend`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              extensionHours: parseInt(this.extensionHours),
            }),
          },
        )

        const result = await response.json()
        if (result.success) {
          this.$emit('show-message', `Timer extended by ${this.extensionHours} hours`, 'success')
          this.loadAuctions(false) // Refresh data
          this.closeExtendDialog()
        } else {
          throw new Error(result.message || 'Failed to extend timer')
        }
      } catch (error) {
        console.error('Error extending timer:', error)
        this.$emit('show-message', `Failed to extend timer: ${error.message}`, 'error')
      } finally {
        this.extending = false
      }
    },

    handleViewDetails(auction) {
      // Emit event to parent component to show auction details
      this.$emit('view-auction-details', auction)
    },

    handleViewParticipants(auction) {
      // Emit event to parent component to show auction participants
      this.$emit('view-auction-participants', auction)
    },

    handleSelectWinner(auction) {
      this.selectedAuction = auction
      this.showWinnerDialog = true
    },

    closeWinnerDialog() {
      this.showWinnerDialog = false
      this.selectedAuction = null
    },

    async confirmSelectWinner() {
      if (!this.selectedAuction) return

      this.selectingWinner = true
      try {
        const token = sessionStorage.getItem('authToken')
        const response = await fetch(
          `${this.apiBaseUrl}/api/auctions/${this.selectedAuction.auction_id}/select-winner`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        const result = await response.json()
        if (result.success) {
          this.$emit(
            'show-message',
            `Auction ended for ${this.selectedAuction.stall_number}. Winner: ${result.data.winner_name} with bid ₱${this.formatPrice(result.data.winning_bid)}`,
            'success',
          )
          this.loadAuctions(false) // Refresh data
          this.closeWinnerDialog()
        } else {
          throw new Error(result.message || 'Failed to end auction')
        }
      } catch (error) {
        console.error('Error ending auction:', error)
        this.$emit('show-message', `Failed to end auction: ${error.message}`, 'error')
      } finally {
        this.selectingWinner = false
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    formatPrice(price) {
      if (!price) return '0'
      return parseFloat(price).toLocaleString()
    },

    /**
     * Load bidders for all auctions from the database
     * @param {Array} auctions - Array of auction objects
     */
    async loadBiddersForAuctions(auctions) {
      console.log('🔍 Loading bidders for auctions...')

      // Don't fail the entire process if bidders can't be loaded
      const bidderPromises = auctions.map(async (auction) => {
        try {
          console.log(
            `🔍 Loading bidders for auction ${auction.stall_number} (stall_id: ${auction.stall_id})`,
          )
          const response = await participantsService.getAuctionBidders(auction.stall_id)
          if (response.success) {
            auction.bidder_count = response.count
            auction.bid_count = response.count // Assuming each bidder has made one bid
            auction.current_bid = response.highest_bid || auction.starting_bid
            auction.highest_bidder = response.highest_bidder
            auction.recent_bids = response.data.slice(0, 2).map((bidder) => ({
              bidder_name: bidder.bidder_name,
              bid_amount: bidder.bid_amount,
            }))
            console.log(`✅ Loaded ${response.count} bidders for auction ${auction.stall_number}`)
          } else {
            console.warn(
              `⚠️ Failed to load bidders for auction ${auction.stall_number}:`,
              response.message,
            )
            // Set default values instead of failing
            auction.bidder_count = 0
            auction.bid_count = 0
            auction.current_bid = auction.starting_bid
            auction.highest_bidder = null
            auction.recent_bids = []
          }
        } catch (error) {
          console.error(`❌ Error loading bidders for auction ${auction.stall_number}:`, error)
          // Set default values to prevent UI from breaking
          auction.bidder_count = 0
          auction.bid_count = 0
          auction.current_bid = auction.starting_bid
          auction.highest_bidder = null
          auction.recent_bids = []

          // Show a user-friendly message for debugging
          if (error.status === 404) {
            console.warn(`⚠️ No participants endpoint found for stall ${auction.stall_id}`)
          } else if (error.status === 401) {
            console.warn(
              `⚠️ Authentication failed when loading bidders for stall ${auction.stall_id}`,
            )
          } else if (!error.status) {
            console.warn(`⚠️ Network error when loading bidders for stall ${auction.stall_id}`)
          }
        }
      })

      // Wait for all bidder loading attempts to complete
      await Promise.allSettled(bidderPromises)
      console.log('✅ Finished loading bidders for all auctions (with fallbacks)')
    },
  },
}
