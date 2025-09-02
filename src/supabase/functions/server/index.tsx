import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// User signup route
app.post('/make-server-2a067818/signup', async (c) => {
  try {
    const { email, password, name, userType, location, aadhaarNumber } = await c.req.json()
    
    // Validate Aadhaar number
    const aadhaarRegex = /^\d{12}$/
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return c.json({ error: 'Aadhaar number must be exactly 12 digits' }, 400)
    }
    
    // Check if Aadhaar number already exists
    const existingUsers = await kv.getByPrefix('user_')
    const aadhaarExists = existingUsers.some(user => user.aadhaarNumber === aadhaarNumber)
    
    if (aadhaarExists) {
      return c.json({ error: 'Aadhaar number already registered' }, 400)
    }
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType, location, aadhaarNumber },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store additional user data in KV store
    await kv.set(`user_${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType, // farmer, wholesaler, retailer, consumer
      location,
      aadhaarNumber,
      createdAt: new Date().toISOString(),
      verified: true // Auto-verified with Aadhaar
    })
    
    return c.json({ 
      user: data.user,
      message: 'User created successfully' 
    })
    
  } catch (error) {
    console.log('Signup route error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get user profile
app.get('/make-server-2a067818/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in profile route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404)
    }
    
    return c.json({ user: userData })
    
  } catch (error) {
    console.log('Profile route error:', error)
    return c.json({ error: 'Internal server error while fetching profile' }, 500)
  }
})

// Create a new product
app.post('/make-server-2a067818/products', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in create product route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404)
    }
    
    // Allow farmers, wholesalers, and retailers to create products
    if (!['farmer', 'wholesaler', 'retailer'].includes(userData.userType)) {
      return c.json({ error: 'Only farmers, wholesalers, and retailers can create products' }, 403)
    }
    
    // Parse form data
    const formData = await c.req.formData()
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const harvestDate = formData.get('harvestDate') as string
    const quantity = parseFloat(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const quality = formData.get('quality') as string
    const description = formData.get('description') as string || ''
    const handlingCharge = parseFloat(formData.get('handlingCharge') as string) || 0
    const productImage = formData.get('productImage') as File
    
    // Generate product ID
    const timestamp = Date.now()
    const productId = `PR${timestamp.toString().slice(-6)}`
    
    let imageUrl = null
    
    // Handle image upload if provided
    if (productImage && productImage.size > 0) {
      try {
        const bucketName = 'make-2a067818-product-images'
        
        // Create bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
        if (!bucketExists) {
          await supabase.storage.createBucket(bucketName, { public: false })
        }
        
        // Upload image
        const fileName = `${productId}_${Date.now()}_${productImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, productImage, {
            contentType: productImage.type
          })
        
        if (uploadError) {
          console.log('Image upload error:', uploadError)
        } else {
          // Get signed URL for the uploaded image
          const { data: signedUrlData } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry
          
          if (signedUrlData) {
            imageUrl = signedUrlData.signedUrl
          }
        }
      } catch (uploadError) {
        console.log('Image upload error:', uploadError)
        // Continue without image if upload fails
      }
    }
    
    // Generate blockchain hash simulation
    const blockchainHash = `0x${Math.random().toString(16).slice(2, 14)}...`
    
    // Create product with pricing structure
    const originalPrice = userData.userType === 'farmer' ? price : null
    const finalPrice = userData.userType === 'farmer' ? price : (price + handlingCharge)
    
    const product = {
      id: productId,
      name,
      category,
      harvestDate,
      quantity,
      price: finalPrice, // Final selling price
      originalPrice: originalPrice, // Farmer's original price (null for non-farmers)
      handlingCharge: userData.userType !== 'farmer' ? handlingCharge : 0,
      quality,
      description,
      imageUrl,
      farmerId: userData.userType === 'farmer' ? user.id : null,
      farmerName: userData.userType === 'farmer' ? userData.name : null,
      addedBy: user.id,
      addedByName: userData.name,
      addedByType: userData.userType,
      location: userData.location,
      status: 'Available',
      currentLocation: userData.userType === 'farmer' ? `${userData.name}'s Farm` : `${userData.name}'s ${userData.userType} Store`,
      blockchainHash,
      qrCode: `QR_${productId}`,
      createdAt: new Date().toISOString(),
      supplyChain: [
        {
          stage: userData.userType === 'farmer' ? 'Farm' : (userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)),
          location: userData.location,
          date: harvestDate,
          status: 'completed',
          updatedBy: user.id,
          updatedByName: userData.name,
          timestamp: new Date().toISOString(),
          notes: `Product ${userData.userType === 'farmer' ? 'registered' : 'added'} by ${userData.name} (${userData.userType})`
        }
      ]
    }
    
    // Save product
    await kv.set(`product_${productId}`, product)
    
    // Add to user's product list
    const userProductsKey = `${userData.userType}_products_${user.id}`
    const userProducts = await kv.get(userProductsKey) || []
    userProducts.push(productId)
    await kv.set(userProductsKey, userProducts)
    
    return c.json({ product, message: 'Product created successfully' })
    
  } catch (error) {
    console.log('Create product error:', error)
    return c.json({ error: 'Internal server error while creating product' }, 500)
  }
})

// Get all products (with pagination)
app.get('/make-server-2a067818/products', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const category = c.req.query('category')
    const location = c.req.query('location')
    const status = c.req.query('status')
    
    // Get all product keys
    const productKeys = await kv.getByPrefix('product_')
    
    if (!productKeys || productKeys.length === 0) {
      return c.json({ products: [], total: 0, page, limit })
    }
    
    // Filter products based on query parameters
    let products = productKeys.filter(product => {
      if (category && product.category !== category) return false
      if (location && !product.location.toLowerCase().includes(location.toLowerCase())) return false
      if (status && product.status !== status) return false
      return true
    })
    
    // Sort by creation date (newest first)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedProducts = products.slice(startIndex, startIndex + limit)
    
    return c.json({
      products: paginatedProducts,
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit)
    })
    
  } catch (error) {
    console.log('Get products error:', error)
    return c.json({ error: 'Internal server error while fetching products' }, 500)
  }
})

// Get specific product by ID
app.get('/make-server-2a067818/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    
    const product = await kv.get(`product_${productId}`)
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    return c.json({ product })
    
  } catch (error) {
    console.log('Get product error:', error)
    return c.json({ error: 'Internal server error while fetching product' }, 500)
  }
})

// Update product supply chain
app.post('/make-server-2a067818/products/:id/track', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in track product route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const productId = c.req.param('id')
    const { stage, location, notes } = await c.req.json()
    
    const product = await kv.get(`product_${productId}`)
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    // Update supply chain
    const newSupplyChainEntry = {
      stage,
      location,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      updatedBy: user.id,
      updatedByName: userData.name,
      timestamp: new Date().toISOString(),
      notes
    }
    
    product.supplyChain.push(newSupplyChainEntry)
    product.currentLocation = location
    
    // Update product status based on stage
    if (stage === 'Consumer') {
      product.status = 'Delivered'
    } else if (stage === 'Retail') {
      product.status = 'Available for Purchase'
    } else {
      product.status = 'In Transit'
    }
    
    await kv.set(`product_${productId}`, product)
    
    return c.json({ 
      product, 
      message: 'Product tracking updated successfully' 
    })
    
  } catch (error) {
    console.log('Track product error:', error)
    return c.json({ error: 'Internal server error while updating product tracking' }, 500)
  }
})

// Get analytics data
app.get('/make-server-2a067818/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in analytics route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get all products for analytics
    const allProducts = await kv.getByPrefix('product_')
    const allUsers = await kv.getByPrefix('user_')
    
    // Calculate analytics
    const totalProducts = allProducts.length
    const totalFarmers = allUsers.filter(user => user.userType === 'farmer').length
    const totalWholesalers = allUsers.filter(user => user.userType === 'wholesaler').length
    const totalRetailers = allUsers.filter(user => user.userType === 'retailer').length
    const totalConsumers = allUsers.filter(user => user.userType === 'consumer').length
    
    // Product status breakdown
    const statusBreakdown = {
      'Ready for Pickup': 0,
      'In Transit': 0,
      'Available for Purchase': 0,
      'Delivered': 0
    }
    
    // Category breakdown
    const categoryBreakdown = {}
    
    // Regional breakdown
    const regionalBreakdown = {}
    
    // Price trends
    const priceData = {}
    
    allProducts.forEach(product => {
      // Status
      if (statusBreakdown.hasOwnProperty(product.status)) {
        statusBreakdown[product.status]++
      }
      
      // Category
      if (product.category) {
        categoryBreakdown[product.category] = (categoryBreakdown[product.category] || 0) + 1
      }
      
      // Regional
      const location = product.location.split(',')[0] // Get city name
      regionalBreakdown[location] = (regionalBreakdown[location] || 0) + 1
      
      // Price
      if (product.name && product.price) {
        if (!priceData[product.name]) {
          priceData[product.name] = []
        }
        priceData[product.name].push(product.price)
      }
    })
    
    // Calculate average prices
    const avgPrices = {}
    Object.keys(priceData).forEach(product => {
      const prices = priceData[product]
      avgPrices[product] = prices.reduce((sum, price) => sum + price, 0) / prices.length
    })
    
    const analytics = {
      overview: {
        totalProducts,
        totalFarmers,
        totalWholesalers,
        totalRetailers,
        totalConsumers,
        totalUsers: allUsers.length
      },
      products: {
        statusBreakdown,
        categoryBreakdown,
        regionalBreakdown
      },
      pricing: {
        averagePrices: avgPrices,
        priceTransparency: 97 // Mock percentage
      },
      supplyChain: {
        averageDays: 3.2, // Mock data
        qualityRetention: 94, // Mock percentage
        efficiency: 85 // Mock percentage
      }
    }
    
    return c.json({ analytics })
    
  } catch (error) {
    console.log('Analytics error:', error)
    return c.json({ error: 'Internal server error while fetching analytics' }, 500)
  }
})

// Search products
app.get('/make-server-2a067818/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || ''
    
    if (!query) {
      return c.json({ products: [], message: 'Search query required' })
    }
    
    const allProducts = await kv.getByPrefix('product_')
    
    const searchResults = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.farmerName.toLowerCase().includes(query) ||
      product.location.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query))
    )
    
    // Sort by relevance (exact matches first)
    searchResults.sort((a, b) => {
      const aScore = (
        (a.name.toLowerCase() === query ? 10 : 0) +
        (a.name.toLowerCase().startsWith(query) ? 5 : 0) +
        (a.farmerName.toLowerCase().includes(query) ? 3 : 0)
      )
      const bScore = (
        (b.name.toLowerCase() === query ? 10 : 0) +
        (b.name.toLowerCase().startsWith(query) ? 5 : 0) +
        (b.farmerName.toLowerCase().includes(query) ? 3 : 0)
      )
      return bScore - aScore
    })
    
    return c.json({ 
      products: searchResults.slice(0, 20), // Limit to 20 results
      total: searchResults.length,
      query 
    })
    
  } catch (error) {
    console.log('Search error:', error)
    return c.json({ error: 'Internal server error during search' }, 500)
  }
})

// QR Code lookup
app.get('/make-server-2a067818/qr/:code', async (c) => {
  try {
    const qrCode = c.req.param('code')
    
    // Find product by QR code
    const allProducts = await kv.getByPrefix('product_')
    const product = allProducts.find(p => p.qrCode === qrCode)
    
    if (!product) {
      return c.json({ error: 'Product not found for QR code' }, 404)
    }
    
    return c.json({ product })
    
  } catch (error) {
    console.log('QR lookup error:', error)
    return c.json({ error: 'Internal server error during QR lookup' }, 500)
  }
})

// Purchase product
app.post('/make-server-2a067818/purchase', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in purchase route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404)
    }
    
    if (userData.userType === 'farmer') {
      return c.json({ error: 'Farmers cannot purchase products' }, 403)
    }
    
    const { productId, quantity, deliveryAddress, totalPrice } = await c.req.json()
    
    // Get product details
    const product = await kv.get(`product_${productId}`)
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    if (product.status === 'Sold' || product.status === 'Delivered') {
      return c.json({ error: 'Product is no longer available for purchase' }, 400)
    }
    
    // Check if sufficient quantity is available
    const availableQuantity = product.quantity || 100
    if (quantity > availableQuantity) {
      return c.json({ error: `Only ${availableQuantity} kg available` }, 400)
    }
    
    // Generate purchase ID
    const timestamp = Date.now()
    const purchaseId = `PU${timestamp.toString().slice(-6)}`
    
    // Create purchase record
    const purchase = {
      id: purchaseId,
      productId,
      productName: product.name,
      buyerId: user.id,
      buyerName: userData.name,
      buyerType: userData.userType,
      sellerId: product.farmerId,
      sellerName: product.farmerName,
      quantity,
      pricePerKg: product.price,
      totalPrice,
      deliveryAddress,
      status: 'Confirmed',
      purchaseDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      createdAt: new Date().toISOString()
    }
    
    // Save purchase
    await kv.set(`purchase_${purchaseId}`, purchase)
    
    // Update product quantity and status
    const updatedProduct = {
      ...product,
      quantity: availableQuantity - quantity,
      status: (availableQuantity - quantity) <= 0 ? 'Sold' : product.status
    }
    
    // Add purchase entry to supply chain
    const purchaseSupplyChainEntry = {
      stage: 'Purchase',
      location: deliveryAddress,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      updatedBy: user.id,
      updatedByName: userData.name,
      timestamp: new Date().toISOString(),
      notes: `Purchased by ${userData.name} (${userData.userType})`
    }
    
    updatedProduct.supplyChain.push(purchaseSupplyChainEntry)
    
    await kv.set(`product_${productId}`, updatedProduct)
    
    // Add to buyer's purchase history
    const buyerPurchases = await kv.get(`buyer_purchases_${user.id}`) || []
    buyerPurchases.push(purchaseId)
    await kv.set(`buyer_purchases_${user.id}`, buyerPurchases)
    
    // Add to seller's sales history
    const sellerSales = await kv.get(`seller_sales_${product.farmerId}`) || []
    sellerSales.push(purchaseId)
    await kv.set(`seller_sales_${product.farmerId}`, sellerSales)
    
    return c.json({ 
      purchase, 
      product: updatedProduct,
      message: 'Product purchased successfully' 
    })
    
  } catch (error) {
    console.log('Purchase error:', error)
    return c.json({ error: 'Internal server error while processing purchase' }, 500)
  }
})

// Get user purchases
app.get('/make-server-2a067818/purchases', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log('Auth error in purchases route:', error)
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await kv.get(`user_${user.id}`)
    
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404)
    }
    
    let purchases = []
    
    if (userData.userType === 'farmer') {
      // Get sales for farmers
      const salesIds = await kv.get(`seller_sales_${user.id}`) || []
      for (const saleId of salesIds) {
        const sale = await kv.get(`purchase_${saleId}`)
        if (sale) purchases.push(sale)
      }
    } else {
      // Get purchases for buyers
      const purchaseIds = await kv.get(`buyer_purchases_${user.id}`) || []
      for (const purchaseId of purchaseIds) {
        const purchase = await kv.get(`purchase_${purchaseId}`)
        if (purchase) purchases.push(purchase)
      }
    }
    
    // Sort by purchase date (newest first)
    purchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    
    return c.json({ purchases })
    
  } catch (error) {
    console.log('Get purchases error:', error)
    return c.json({ error: 'Internal server error while fetching purchases' }, 500)
  }
})

// Health check
app.get('/make-server-2a067818/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SmartBhoomi Supply Chain API'
  })
})

Deno.serve(app.fetch)