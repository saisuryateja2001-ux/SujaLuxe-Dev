# SujaLuxe Design Guidelines

## Design Approach

**Reference-Based Luxury E-Commerce Design**

Drawing inspiration from high-end marketplaces (NET-A-PORTER, 1stdibs, Sotheby's) and interior design platforms (Houzz, Havenly), creating a sophisticated dual-interface system that balances operational efficiency for retailers with an immersive shopping experience for customers.

### Core Design Principles
- **Refined Elegance**: Luxury aesthetic with generous whitespace and premium materials
- **Visual Hierarchy**: Clear distinction between content importance through scale and positioning
- **Dual Personality**: Professional dashboard efficiency + Aspirational customer experience
- **Crown Branding**: Purple crown motif from logo integrated subtly throughout

---

## Typography

### Font System
**Primary**: Playfair Display (serif) - Headlines, luxury product names, hero sections
**Secondary**: Inter (sans-serif) - Body text, UI elements, data tables, forms

### Hierarchy
- **H1**: Playfair Display, 48px (mobile: 32px) - Page titles, hero headlines
- **H2**: Playfair Display, 36px (mobile: 28px) - Section headers
- **H3**: Inter SemiBold, 24px (mobile: 20px) - Card titles, module headers
- **H4**: Inter SemiBold, 18px (mobile: 16px) - Subsection headers
- **Body Large**: Inter Regular, 18px - Product descriptions, important content
- **Body**: Inter Regular, 16px - Standard text, form labels
- **Body Small**: Inter Regular, 14px - Supporting text, metadata
- **Caption**: Inter Medium, 12px - Badges, labels, micro-copy

---

## Layout System

### Spacing Scale
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Tight spacing: 2-4 units (buttons, form fields, compact cards)
- Medium spacing: 6-8 units (card padding, section gaps)
- Generous spacing: 12-20 units (section padding, hero areas)
- Extra generous: 24+ units (major section breaks)

### Grid Structure
**Retailer Dashboard**: 12-column grid with sidebar navigation (280px fixed width)
**Customer Interface**: Fluid responsive grid, max-width-7xl container centered

### Viewport Strategy
- **Hero sections**: 75-85vh for impactful product showcases
- **Content sections**: Natural height based on content with py-16 to py-24
- **Dashboard modules**: Compact cards with efficient data density

---

## Component Library

### Retailer Dashboard Components

**Sidebar Navigation**
- Fixed left sidebar with logo at top
- Hierarchical menu with icons (Heroicons outline style)
- Active state with subtle accent indicator
- Collapsible on mobile

**Dashboard Cards**
- Elevated cards with subtle shadow
- Metric cards: Large number display with trend indicators (↑↓ arrows)
- Chart cards: Clean data visualizations using Chart.js or Recharts
- Table cards: Striped rows, sortable headers, hover states

**Data Tables**
- Compact row height with clear cell boundaries
- Sticky headers for long tables
- Action buttons (View, Edit, Delete) aligned right
- Status badges with semantic meaning (Pending, Completed, Cancelled)
- Pagination controls at bottom

**Forms & Inputs**
- Floating labels on focus
- Clear validation states (success, error, warning)
- File upload areas with drag-and-drop zones
- Rich text editor for product descriptions

### Customer Interface Components

**Product Cards**
- Large high-quality product images (square aspect ratio)
- Elegant hover effect with zoom or overlay
- Product name, price, retailer info
- Quick action buttons (Add to Cart, Quick View)
- Wishlist heart icon top-right

**AI Room Designer Interface**
- Split screen: Product selection panel (left) + Canvas view (right)
- Canvas toolbar: Room type selector, Wall/Floor toggle, Angle controls
- Generated image gallery with multi-angle views
- Confirm & Checkout button prominently placed

**Negotiation Chat**
- Clean chat bubble design (customer: right-aligned, retailer: left-aligned)
- Product context card pinned at top
- Quote comparison table when multiple retailers respond
- Accept/Counter-offer action buttons

**Auction Cards**
- Countdown timer prominently displayed
- Current bid with bidder count
- Bid history timeline
- Place bid input with validation
- Winner announcement banner post-auction

### Shared Components

**Navigation Header**
- Sticky top navigation with translucent backdrop blur
- Logo left, search center, user menu + cart right
- Breadcrumb navigation on internal pages

**Buttons**
- Primary: Solid fill with hover lift effect
- Secondary: Outline with hover fill transition
- Ghost: Text-only with hover background
- Icon buttons: Circular with centered icon
- Consistent padding: px-6 py-3 for standard buttons

**Modals & Overlays**
- Centered modal with backdrop blur
- Slide-in panels for filters, cart preview
- Toast notifications top-right with auto-dismiss

**Badges & Status Indicators**
- Pill-shaped badges for categories, tags
- Dot indicators for status (success, warning, error, info)
- Stock indicators: In Stock (subtle), Low Stock (warning), Out of Stock (muted)

---

## Images

### Hero Section
**Customer Homepage**: Full-width luxury interior showcase (high-end living room, bedroom, or curated product arrangement) at 85vh height. Overlay gradient from bottom for text readability. CTA buttons with backdrop blur background.

**Retailer Dashboard**: No hero image; immediate dashboard view upon login.

### Product Images
- Primary product images: 1:1 aspect ratio, minimum 800x800px
- Lifestyle images: 16:9 for room context shots
- AI-generated room visualizations: Multiple angles (front, side, perspective) displayed in gallery grid

### Supporting Imagery
- Category banners: Wide aspect ratio (3:1) with subtle overlays
- Retailer profile: Logo/brand image, business photos
- Marketing campaign banners: Full-width promotional imagery
- Empty states: Elegant illustrations for "No products," "No orders" scenarios

---

## Visual Enhancements

### Luxury Touches
- Subtle crown icon watermark in background of key sections
- Metallic accent line separators (1px with gradient shimmer effect)
- Soft shadows for depth (shadow-sm to shadow-lg, never harsh)
- Premium color palette integration (purple/gold accents from logo)

### Animations (Minimal)
- Smooth transitions on hover states (200ms ease)
- Page load: Gentle fade-in for content sections
- Modal/panel entrance: Slide + fade combination
- **No scroll-triggered animations** - keep focus on content

### Accessibility
- High contrast text ratios (WCAG AA minimum)
- Focus indicators on all interactive elements
- Semantic HTML structure throughout
- ARIA labels for icon-only buttons

---

## Section-Specific Layouts

### Retailer Dashboard Home
Multi-column metric cards (4 columns on desktop, 2 on tablet, 1 on mobile) showing: Total Sales, Monthly Revenue, Active Orders, Low Stock Alerts. Below: Recent orders table + Sales chart side-by-side.

### Customer Product Catalog
Masonry grid for product cards (4 columns desktop, 2 tablet, 1 mobile). Sidebar filters (categories, price range, retailer). Sticky filter button on mobile.

### Order Management (Retailer)
Full-width table with all order details. Expandable rows for delivery address and notes. Filter tabs at top (All, Pending, Shipped, Delivered, Cancelled).

### AI Room Designer
Full-screen immersive experience. Product palette drawer (left 25%), main canvas (center 50%), generated previews gallery (right 25%). Mobile: Stacked vertical layout.

### Auction Listing
Grid of auction cards (3 columns desktop) with live countdown timers. Featured auctions carousel at top. Filter by category, status (Active, Ending Soon, Closed).

---

## Responsive Breakpoints
- Mobile: < 640px (single column, stacked navigation)
- Tablet: 640px - 1024px (2-column grids, condensed layouts)
- Desktop: > 1024px (full multi-column layouts, sidebar navigation)