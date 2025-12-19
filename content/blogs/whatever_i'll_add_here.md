---
title: "Complete Markdown Formatting Guide"
date: "2024-12-21"
author: "Tech Writer"
excerpt: "Master all markdown formatting features including tables, lists, and nested points"
coverImage: "https://res.cloudinary.com/daetdadtt/image/upload/v1765957021/en_ntufks.webp"
tags: ["markdown", "formatting", "tutorial"]
---

# Complete Markdown Formatting Guide

This guide demonstrates all available formatting options.

## Bullet Points (Unordered Lists)

Simple bullet points:
- First item
- Second item
- Third item

Nested bullet points:
- Main point 1
  - Sub-point 1.1
  - Sub-point 1.2
    - Nested sub-point 1.2.1
    - Nested sub-point 1.2.2
- Main point 2
  - Sub-point 2.1

## Numbered Lists (Ordered Lists)

Basic numbered list:
1. First step
2. Second step
3. Third step

Nested numbered lists:
1. Introduction
   1. Overview
   2. Prerequisites
      1. Node.js installation
      2. VS Code setup
2. Main Content
   1. Setup process
   2. Configuration
3. Conclusion

## Mixed Lists

Combining bullets and numbers:
1. **Phase 1: Planning**
   - Define objectives
   - Identify stakeholders
   - Set timeline
2. **Phase 2: Execution**
   - Build features
     1. Frontend development
     2. Backend development
     3. Testing
   - Deploy to production
3. **Phase 3: Maintenance**
   - Monitor performance
   - Fix bugs
   - Gather feedback

## Advanced Table Examples

### Basic Data Table

| Product | Price | Stock | Status |
|---------|-------|-------|--------|
| Laptop | $999 | 45 | ✅ Available |
| Mouse | $25 | 120 | ✅ Available |
| Keyboard | $75 | 0 | ❌ Out of Stock |
| Monitor | $299 | 18 | ⚠️ Low Stock |

### Aligned Table

| Item | Description | Quantity | Price | Total |
|:-----|:------------|:--------:|------:|------:|
| Apple | Fresh red apples | 10 | $2.50 | $25.00 |
| Banana | Organic bananas | 20 | $1.50 | $30.00 |
| Orange | Valencia oranges | 15 | $3.00 | $45.00 |
| **Total** | | **45** | | **$100.00** |

### Comparison Table

| Feature | Free Plan | Pro Plan | Enterprise |
|---------|:---------:|:--------:|:----------:|
| Users | 1 | 5 | Unlimited |
| Storage | 5GB | 100GB | 1TB |
| Support | Email | Priority | 24/7 Phone |
| Price | $0 | $29/mo | $299/mo |
| Advanced Analytics | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Custom Domain | ❌ | ✅ | ✅ |

### Technical Specifications Table

| Component | Specification | Performance | Notes |
|-----------|---------------|-------------|-------|
| **Processor** | Intel i7-12700K | 3.6 GHz (5.0 GHz Boost) | 12 cores, 20 threads |
| **RAM** | DDR5-4800 | 32GB (2x16GB) | Expandable to 128GB |
| **Storage** | NVMe SSD | 1TB (7000 MB/s read) | PCIe 4.0 x4 |
| **Graphics** | NVIDIA RTX 4070 | 12GB GDDR6X | Ray tracing enabled |
| **Power** | 850W Gold | 80+ Gold Certified | Modular cables |

### Course Schedule Table

| Week | Topic | Subtopics | Assignment | Due Date |
|:----:|-------|-----------|------------|----------|
| 1 | Introduction | • Course overview<br>• Tools setup<br>• First program | Setup environment | Jan 15 |
| 2 | Variables | • Data types<br>• Operators<br>• Type conversion | Variables exercise | Jan 22 |
| 3 | Control Flow | • If statements<br>• Loops<br>• Switch cases | Build calculator | Jan 29 |
| 4 | Functions | • Definition<br>• Parameters<br>• Return values | Function library | Feb 5 |

## Complex Nested Structure

### 1. Project Setup

#### 1.1 Prerequisites
- Node.js v18 or higher
- Git installed
- Code editor (VS Code recommended)

#### 1.2 Installation Steps
1. Clone the repository
   ```bash
   git clone https://github.com/user/repo.git
   cd repo
   ```
2. Install dependencies
   - Run `npm install`
   - Wait for completion
   - Verify installation
3. Configure environment
   1. Copy `.env.example` to `.env`
   2. Fill in required values:
      - Database URL
      - API keys
      - Secret tokens

### 2. Development

#### 2.1 Running Locally
1. Start development server
2. Open browser at `localhost:3000`
3. Make changes and see live reload

#### 2.2 Testing
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Coverage: `npm run test:coverage`

### 3. Deployment

#### 3.1 Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Security audit complete

#### 3.2 Deploy Steps
1. Build production bundle
2. Push to Vercel
3. Verify deployment
4. Monitor for errors

## Code Examples with Tables

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List all users | ✅ Yes |
| POST | `/api/users` | Create new user | ✅ Yes |
| GET | `/api/users/:id` | Get user by ID | ✅ Yes |
| PUT | `/api/users/:id` | Update user | ✅ Yes |
| DELETE | `/api/users/:id` | Delete user | ✅ Yes |

Example request:
```javascript
const response = await fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  }
});
```

## Summary

Key takeaways:
1. **Bullet points** work for simple lists
2. **Numbered lists** work for sequential steps
3. **Tables** support complex data
   - Multiple columns
   - Text alignment
   - Formatting within cells
4. **Nesting** allows for hierarchical content
   1. Main points
      - Sub-points
        1. Nested numbers
        2. Multiple levels

That's everything you need to create well-formatted blog posts!