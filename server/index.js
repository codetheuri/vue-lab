import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 8000
const DB_PATH = path.join(__dirname, 'db.json')

const DEFAULT_DB = {
  users: [
    { id: 1, name: 'Alex Morgan', email: 'admin@company.com', password: 'admin123', role: 'Admin' },
    { id: 2, name: 'Jordan Lee', email: 'manager@company.com', password: 'manager123', role: 'Manager' },
    { id: 3, name: 'Sam Taylor', email: 'staff@company.com', password: 'staff123', role: 'Viewer' }
  ],
  employees: [
    { id: 1, name: 'Alex Morgan', email: 'alex.morgan@company.com', role: 'Lead Systems Architect', department: 'Engineering', status: 'Active', joinDate: '2024-03-15' },
    { id: 2, name: 'Jordan Lee', email: 'jordan.lee@company.com', role: 'Operations Manager', department: 'Operations', status: 'Active', joinDate: '2024-06-01' },
    { id: 3, name: 'Sam Taylor', email: 'sam.taylor@company.com', role: 'Inventory Coordinator', department: 'Logistics', status: 'Active', joinDate: '2025-01-10' }
  ],
  products: [
    { id: 1, name: 'ThinkPad X1 Carbon Gen 12', sku: 'LPT-001', category: 'Laptops', price: 1499.99, stock: 14 },
    { id: 2, name: 'Dell UltraSharp 27" 4K Monitor', sku: 'MON-002', category: 'Monitors', price: 549.00, stock: 6 },
    { id: 3, name: 'Logitech MX Master 3S', sku: 'ACC-003', category: 'Accessories', price: 99.99, stock: 0 }
  ]
}

// Encode / decode lightweight bearer token carrying { id, email, role, iat }
function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now()
    }),
    'utf-8'
  ).toString('base64url')
  return `vuelab.${payload}`
}

function verifyToken(req, db) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }

  const [scheme, token] = authHeader.trim().split(/\s+/)
  if (scheme !== 'Bearer' || !token || !token.startsWith('vuelab.')) {
    return null
  }

  try {
    const encodedPayload = token.slice('vuelab.'.length)
    const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'))
    if (!decoded || !decoded.id || !decoded.email) {
      return null
    }

    // Sync latest role from db.users if present (handles role changes via PUT /api/auth/profile)
    const dbUser = db.users.find(
      u => Number(u.id) === Number(decoded.id) || u.email.toLowerCase() === String(decoded.email).toLowerCase()
    )

    if (dbUser) {
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      }
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'Viewer'
    }
  } catch {
    return null
  }
}

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8')
    return JSON.parse(JSON.stringify(DEFAULT_DB))
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON payload'))
      }
    })
    req.on('error', reject)
  })
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  res.end(JSON.stringify(payload))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    return res.end()
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
  const pathname = parsedUrl.pathname
  const method = req.method

  try {
    const db = readDB()

    // =========================================================================
    // API ROOT / HEALTH CHECK
    // =========================================================================
    if (pathname === '/api' && method === 'GET') {
      return sendJSON(res, 200, {
        status: 'ok',
        service: 'Vue-lab REST API',
        endpoints: {
          auth: ['POST /api/auth/login', 'POST /api/auth/logout', 'PUT /api/auth/profile'],
          employees: [
            'GET /api/employees',
            'POST /api/employees',
            'PUT /api/employees/:id',
            'DELETE /api/employees/:id',
            'POST /api/employees/reset'
          ],
          products: [
            'GET /api/products',
            'POST /api/products',
            'PUT /api/products/:id',
            'DELETE /api/products/:id',
            'POST /api/products/reset'
          ]
        }
      })
    }

    // =========================================================================
    // AUTH ENDPOINTS
    // =========================================================================
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseBody(req)
      const user = db.users.find(
        u => u.email.toLowerCase() === String(email || '').toLowerCase() && u.password === password
      )

      if (!user) {
        return sendJSON(res, 401, { message: 'Invalid email or password.' })
      }

      const { password: _, ...safeUser } = user
      return sendJSON(res, 200, {
        user: safeUser,
        token: createToken(safeUser)
      })
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      return sendJSON(res, 200, { message: 'Logged out successfully.' })
    }

    if (pathname === '/api/auth/profile' && method === 'PUT') {
      const currentUser = verifyToken(req, db)
      if (!currentUser) {
        return sendJSON(res, 401, { message: 'Unauthorized: Missing or invalid Bearer token.' })
      }

      const body = await parseBody(req)
      const targetIndex = db.users.findIndex(
        u =>
          Number(u.id) === Number(currentUser.id) ||
          u.email.toLowerCase() === String(currentUser.email || '').toLowerCase()
      )

      if (targetIndex !== -1) {
        if (body.name !== undefined && String(body.name).trim()) {
          db.users[targetIndex].name = String(body.name).trim()
        }
        if (body.role !== undefined) {
          db.users[targetIndex].role = body.role
        }
        writeDB(db)
        const { password: _, ...safeUser } = db.users[targetIndex]
        return sendJSON(res, 200, {
          user: safeUser,
          token: createToken(safeUser)
        })
      }

      return sendJSON(res, 404, { message: 'User account not found.' })
    }

    // =========================================================================
    // PROTECTED ROUTES: /api/employees & /api/products (401 + 403)
    // =========================================================================
    const isEmployeesRoute = pathname === '/api/employees' || pathname.startsWith('/api/employees/')
    const isProductsRoute = pathname === '/api/products' || pathname.startsWith('/api/products/')

    if (isEmployeesRoute || isProductsRoute) {
      const currentUser = verifyToken(req, db)
      if (!currentUser) {
        return sendJSON(res, 401, { message: 'Unauthorized: Missing or invalid Bearer token.' })
      }

      const isDestructive =
        method === 'DELETE' ||
        pathname === '/api/employees/reset' ||
        pathname === '/api/products/reset'

      if (isDestructive && currentUser.role !== 'Admin') {
        return sendJSON(res, 403, {
          message: `Forbidden: ${currentUser.role} role is not permitted to perform destructive actions.`
        })
      }
    }

    // =========================================================================
    // EMPLOYEES ENDPOINTS
    // =========================================================================
    if (pathname === '/api/employees' && method === 'GET') {
      return sendJSON(res, 200, db.employees)
    }

    if (pathname === '/api/employees' && method === 'POST') {
      const body = await parseBody(req)
      const normalizedEmail = String(body.email || '').trim().toLowerCase()

      if (normalizedEmail) {
        const duplicate = db.employees.find(e => String(e.email || '').trim().toLowerCase() === normalizedEmail)
        if (duplicate) {
          return sendJSON(res, 422, {
            message: 'Validation failed',
            errors: { email: 'This email is already registered' }
          })
        }
      }

      const nextId = db.employees.length > 0 ? Math.max(...db.employees.map(e => Number(e.id) || 0)) + 1 : 1
      const newEmployee = {
        id: nextId,
        name: body.name || 'Unnamed Employee',
        email: body.email || '',
        role: body.role || 'Staff',
        department: body.department || 'General',
        status: body.status || 'Active',
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        ...body,
        id: nextId
      }
      db.employees.push(newEmployee)
      writeDB(db)
      return sendJSON(res, 201, newEmployee)
    }

    if (pathname === '/api/employees/reset' && method === 'POST') {
      db.employees = JSON.parse(JSON.stringify(DEFAULT_DB.employees))
      writeDB(db)
      return sendJSON(res, 200, db.employees)
    }

    const employeeMatch = pathname.match(/^\/api\/employees\/(\d+)$/)
    if (employeeMatch) {
      const id = Number(employeeMatch[1])
      const index = db.employees.findIndex(e => Number(e.id) === id)

      if (index === -1) {
        return sendJSON(res, 404, { message: `Employee #${id} not found.` })
      }

      if (method === 'PUT') {
        const body = await parseBody(req)
        const normalizedEmail = String(body.email || '').trim().toLowerCase()

        if (normalizedEmail) {
          const duplicate = db.employees.find(
            e => Number(e.id) !== id && String(e.email || '').trim().toLowerCase() === normalizedEmail
          )
          if (duplicate) {
            return sendJSON(res, 422, {
              message: 'Validation failed',
              errors: { email: 'This email is already registered' }
            })
          }
        }

        db.employees[index] = { ...db.employees[index], ...body, id }
        writeDB(db)
        return sendJSON(res, 200, db.employees[index])
      }

      if (method === 'DELETE') {
        const deleted = db.employees.splice(index, 1)[0]
        writeDB(db)
        return sendJSON(res, 200, { message: 'Employee deleted.', employee: deleted })
      }
    }

    // =========================================================================
    // PRODUCTS ENDPOINTS
    // =========================================================================
    if (pathname === '/api/products' && method === 'GET') {
      return sendJSON(res, 200, db.products)
    }

    if (pathname === '/api/products' && method === 'POST') {
      const body = await parseBody(req)
      const normalizedSku = String(body.sku || '').trim().toLowerCase()

      if (normalizedSku) {
        const duplicate = db.products.find(p => String(p.sku || '').trim().toLowerCase() === normalizedSku)
        if (duplicate) {
          return sendJSON(res, 422, {
            message: 'Validation failed',
            errors: { sku: 'This SKU is already in use' }
          })
        }
      }

      const nextId = db.products.length > 0 ? Math.max(...db.products.map(p => Number(p.id) || 0)) + 1 : 1
      const newProduct = {
        id: nextId,
        name: body.name || 'Unnamed Product',
        sku: body.sku || `SKU-${nextId}`,
        category: body.category || 'General',
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
        ...body,
        id: nextId
      }
      db.products.push(newProduct)
      writeDB(db)
      return sendJSON(res, 201, newProduct)
    }

    if (pathname === '/api/products/reset' && method === 'POST') {
      db.products = JSON.parse(JSON.stringify(DEFAULT_DB.products))
      writeDB(db)
      return sendJSON(res, 200, db.products)
    }

    const productMatch = pathname.match(/^\/api\/products\/(\d+)$/)
    if (productMatch) {
      const id = Number(productMatch[1])
      const index = db.products.findIndex(p => Number(p.id) === id)

      if (index === -1) {
        return sendJSON(res, 404, { message: `Product #${id} not found.` })
      }

      if (method === 'PUT') {
        const body = await parseBody(req)
        const normalizedSku = String(body.sku || '').trim().toLowerCase()

        if (normalizedSku) {
          const duplicate = db.products.find(
            p => Number(p.id) !== id && String(p.sku || '').trim().toLowerCase() === normalizedSku
          )
          if (duplicate) {
            return sendJSON(res, 422, {
              message: 'Validation failed',
              errors: { sku: 'This SKU is already in use' }
            })
          }
        }

        db.products[index] = {
          ...db.products[index],
          ...body,
          id,
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.stock !== undefined && { stock: Number(body.stock) })
        }
        writeDB(db)
        return sendJSON(res, 200, db.products[index])
      }

      if (method === 'DELETE') {
        const deleted = db.products.splice(index, 1)[0]
        writeDB(db)
        return sendJSON(res, 200, { message: 'Product deleted.', product: deleted })
      }
    }

    // 404 Fallback
    return sendJSON(res, 404, { message: `Route ${method} ${pathname} not found.` })
  } catch (err) {
    console.error('Server error:', err)
    return sendJSON(res, 500, { message: err.message || 'Internal Server Error' })
  }
})

readDB()

server.listen(PORT, () => {
  console.log(` Vue-lab REST API running at http://localhost:${PORT}/api`)
})