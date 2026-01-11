# Personal Financial Tracker - Technical Overview

## Architecture Diagram
```
┌─────────────────────────────────────┐
│        Next.js Frontend             │
│  ┌──────────────────────────────┐   │
│  │  React Components            │   │
│  │  • Dashboard                 │   │
│  │  • Transaction List          │   │
│  │  • Charts (Recharts)         │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  State Management            │   │
│  │  • React Hooks               │   │
│  │  • URL Query Parameters      │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               │ HTTP/JSON (CORS enabled)
               │ RESTful API calls
               ▼
┌─────────────────────────────────────┐
│        Gin Web Framework (Go)       │
│  ┌──────────────────────────────┐   │
│  │  API Endpoints               │   │
│  │  • GET /data/transactions    │   │
│  │  • POST /data/transactions   │   │
│  │  • PATCH /data/transactions  │   │
│  │  • DELETE /data/transactions │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Middleware                  │   │
│  │  • CORS Handler              │   │
│  │  • Logger                    │   │
│  │  • Recovery                  │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               │ Read/Write with caching
               ▼
┌─────────────────────────────────────┐
│      Data Layer                     │
│  ┌──────────────────────────────┐   │
│  │  In-Memory Cache             │   │
│  │  • []transaction (slice)     │   │
│  │  • map[int]*transaction      │   │
│  │  • sync.RWMutex protection   │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  JSON File Storage           │   │
│  │  • transactions.json         │   │
│  │  • Persistent data           │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Tech Stack

**Frontend:**
- Next.js 15 with App Router and Turbopack
- React 19 with modern hooks (useState, useEffect)
- Recharts for interactive data visualization
- Tailwind CSS for responsive styling
- JavaScript ES6+ features

**Backend:**
- Go 1.24 with modern concurrency patterns
- Gin web framework for HTTP routing
- RESTful API design principles
- In-memory caching with thread-safe access
- JSON file-based persistence

**Development Tools:**
- npm for frontend package management
- Go modules for dependency management
- Git for version control

## Key Features

### 1. Interactive Dashboard
![Dashboard](./financial-tracker-frontend/financial-tracker/screenshots/dashboard.png)
- Real-time summary cards showing total income, expenses, and balance
- Recent transactions preview
- Quick access to all features

### 2. Transaction Management
![Transaction List](./financial-tracker-frontend/financial-tracker/screenshots/history.png)
- Full CRUD operations (Create, Read, Update, Delete)
- Modal-based editing interface
- Hover-activated action buttons
- Category-based color coding

### 3. Advanced Filtering
![Date Filter](./financial-tracker-frontend/financial-tracker/screenshots/date-select.png)
- Date range filtering with calendar picker
- URL query parameter persistence
- Shareable/bookmarkable filtered views

### 4. Data Visualization
![Charts](./financial-tracker-frontend/financial-tracker/screenshots/charts.png)
- Spending by category (pie chart)
- Spending over time (line chart)
- Custom tooltips with formatted data
- Responsive chart sizing

## Technical Highlights

### 1. Performance Optimization
**Thread-Safe In-Memory Caching**
```go
var (
    transactionCache    []transaction
    transactionMap      map[int]*transaction
    cacheMutex          sync.RWMutex
)
```
- **O(1) lookups** using hashmap for ID-based queries
- **Thread-safe** concurrent access with `sync.RWMutex`
- **Defensive copying** prevents external cache modifications
- Cache refresh on all write operations

### 2. Advanced Frontend Patterns
**URL State Management**
```javascript
// Persist filters in URL for shareable views
const params = new URLSearchParams(searchParams);
params.set("startDate", date);
router.push(`/?${params.toString()}`);
```
- Filters persist across page navigation
- Users can bookmark specific filtered views
- Browser back/forward buttons work correctly

**Utility-Based Architecture**
```javascript
// Reusable helper functions
export const filterByDateRange = (transactions, startDate, endDate) => {
  // Centralized filtering logic
};
```
- DRY principles with shared utility functions
- Separation of concerns (business logic vs. presentation)
- Easier testing and maintenance

### 3. User Experience Enhancements
- **Context-aware empty states** with helpful messages
- **Hover-activated buttons** for cleaner interface
- **Form validation** ensuring data integrity
- **Responsive design** for mobile and desktop
- **Visual feedback** on all user actions

## Challenges Solved

### Challenge 1: Concurrent Access to Cache
**Problem:** Multiple simultaneous API requests could cause race conditions when reading/writing the cache.

**Solution:** Implemented `sync.RWMutex` for thread-safe operations:
- Multiple concurrent reads allowed
- Exclusive write access when modifying
- Lock/unlock patterns around all cache operations

**Result:** Safe concurrent access with optimal read performance. No data corruption or race conditions.

---

### Challenge 2: Performance with Growing Dataset
**Problem:** Linear O(n) search through transaction slice for ID lookups was inefficient.

**Solution:** Dual data structure approach:
- Maintain slice for ordered iteration
- Maintain hashmap for O(1) ID lookups
- Keep both structures synchronized

**Result:** Constant time O(1) lookups while preserving transaction order for display.

---

### Challenge 3: State Synchronization Across Pages
**Problem:** Date filters needed to persist when navigating between dashboard and full transaction list.

**Solution:** URL query parameters using Next.js router:
```javascript
router.push(`/?${params.toString()}`);
```

**Result:**
- Filters persist across navigation
- Users can bookmark specific views
- Browser history works correctly
- Shareable links maintain filter state

---

### Challenge 4: Clean Component Architecture
**Problem:** Large components with mixed concerns were hard to maintain.

**Solution:** Component composition with utility functions:
- Extracted reusable components (DateRangeFilter, SummaryCards)
- Created utility modules for business logic
- Separated data fetching from presentation

**Result:** Maintainable, testable codebase with clear separation of concerns.

## Code Organization

```
Personal-Financial-Tracker/
├── financial-tracker-frontend/
│   └── financial-tracker/
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.js              # Dashboard with summary
│       │   │   ├── layout.js            # Root layout
│       │   │   └── transactions/
│       │   │       └── page.js          # Full transaction list
│       │   ├── components/
│       │   │   ├── DateRangeFilter.jsx  # Reusable date filter
│       │   │   ├── EditTransactionModal.jsx
│       │   │   ├── SpendingByCategory.jsx
│       │   │   ├── SpendingOverTime.jsx
│       │   │   └── SummaryCards.jsx     # Dashboard metrics
│       │   └── utils/
│       │       ├── transactionHelpers.js # Business logic
│       │       ├── constants.js          # Shared constants
│       │       └── apiHelpers.js         # API configuration
│       └── public/
│           └── images/                   # Static assets
├── financial-tracker-backend/
│   ├── main.go                          # All endpoints & logic
│   └── data/
│       └── transactions.json            # Persistent storage
└── README.md
```

## API Endpoints

| Method | Endpoint | Description | Performance |
|--------|----------|-------------|-------------|
| GET | `/data/transactions` | Retrieve all transactions | Cached, fast |
| GET | `/data/transactions/:id` | Get specific transaction | O(1) lookup |
| POST | `/data/transactions` | Create new transaction | Updates cache |
| PATCH | `/data/transactions/:id` | Update transaction | Updates cache |
| DELETE | `/data/transactions/:id` | Delete transaction | Updates cache |

**CORS Configuration:** All endpoints support cross-origin requests from the frontend.

## What I Learned

### Backend Development
- **Thread-safe concurrent programming** in Go using mutexes
- **Performance optimization** with dual data structures (slice + hashmap)
- **RESTful API design** with proper HTTP methods and status codes
- **Middleware patterns** for cross-cutting concerns (CORS, logging)
- **File I/O** with JSON marshaling/unmarshaling

### Frontend Development
- **Modern React patterns** with hooks and functional components
- **Next.js App Router** with file-based routing
- **URL state management** for shareable views
- **Data visualization** with Recharts library
- **Responsive design** with Tailwind CSS utility classes

### Full-Stack Integration
- **API design** balancing frontend needs with backend constraints
- **Error handling** across client-server boundary
- **State management** across multiple pages
- **Asynchronous operations** with async/await
- **CORS configuration** for cross-origin requests

### Software Engineering Practices
- **Code organization** with clear separation of concerns
- **DRY principles** through utility functions
- **Component composition** for maintainability
- **Performance considerations** in design decisions
- **User experience** focus in feature implementation

---

*This project demonstrates comprehensive full-stack development skills, from database design and API architecture to frontend state management and user interface design.*
