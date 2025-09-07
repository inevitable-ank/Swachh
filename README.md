# 🏛️ Swachhta - Civic Issue Reporting & Management Platform

<div align="center">

![Swachhta Logo](https://img.shields.io/badge/Swachhta-Civic%20Platform-blue?style=for-the-badge&logo=shield-check)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

**Empowering citizens to report, track, and resolve community issues together**

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [✨ Request Feature](#)

</div>

---

## 🌟 **Overview**

**Swachhta** is a comprehensive civic engagement platform that enables citizens to report, vote on, and track community issues. Built with modern web technologies, it provides an intuitive interface for democratic problem-solving and community collaboration.

### 🎯 **Key Features**

- 📍 **Interactive Issue Reporting** - Report civic issues with precise location mapping
- 🗳️ **Community Voting System** - Vote on issues to prioritize community needs
- 🗺️ **Geographic Visualization** - View all issues on an interactive map
- 📊 **Analytics Dashboard** - Track trends and community engagement
- 🔐 **Secure Authentication** - User accounts with role-based access
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🌙 **Dark/Light Theme** - User preference support

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **NextAuth.js** - Authentication system
- **bcryptjs** - Password hashing

### **External Services**
- **Cloudinary** - Image upload and management
- **Upstash Redis** - Rate limiting and caching
- **Leaflet** - Interactive mapping
- **OpenStreetMap** - Map tiles and geocoding

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+ 
- npm or pnpm
- MongoDB database
- Cloudinary account
- Upstash Redis account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/inevitable-ank/Swachh.git
   cd Swachh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swachhta
   
   # Authentication
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Redis (Rate Limiting)
   UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   
   # Cloudinary (Image Upload)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📋 **Features Breakdown**

### 🏠 **Homepage**
- Welcome section with feature highlights
- User authentication status
- Quick access to main features
- Call-to-action for new users

### 📝 **Issue Reporting**
- **Interactive Map** - Click to select precise location
- **Category Selection** - Road, Water, Sanitation, Electricity, Other
- **Image Upload** - Attach photos with Cloudinary integration
- **Form Validation** - Client and server-side validation
- **Rate Limiting** - 2 issues per 24 hours per user

### 🗳️ **Voting System**
- **One Vote Per User** - Prevents duplicate voting
- **Vote Toggle** - Users can vote/unvote on issues
- **Real-time Counts** - Live vote aggregation
- **Priority Ranking** - Issues sorted by vote count

### 🗺️ **Map Visualization**
- **Geographic Display** - All issues with coordinates
- **Interactive Markers** - Click to view issue details
- **Category Colors** - Visual distinction by issue type
- **Responsive Design** - Mobile-friendly interface

### 📊 **Analytics Dashboard**
- **Issue Statistics** - Total issues, votes, open reports
- **Category Breakdown** - Donut chart distribution
- **Trend Analysis** - Daily reports over time
- **Top Issues** - Most voted issues bar chart

### 👤 **User Management**
- **Secure Registration** - Email validation and password hashing
- **Profile Management** - User account settings
- **Issue History** - Track all reported issues
- **Edit/Delete** - Manage pending issues

---

## 🏗️ **Project Structure**

```
Swachhta/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── issues/        # Issue management
│   │   ├── analytics/     # Analytics data
│   │   └── map/           # Map data
│   ├── auth/              # Authentication pages
│   ├── issues/            # Issue pages
│   ├── map/               # Map visualization
│   ├── analytics/         # Analytics dashboard
│   └── my-issues/         # User's issues
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── charts.tsx        # Custom chart components
│   ├── dynamicMap.tsx    # Interactive map
│   └── navbar.tsx        # Navigation
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database connection
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Helper functions
├── models/               # Database models
│   ├── Issue.ts          # Issue schema
│   ├── User.ts           # User schema
│   └── Vote.ts           # Vote schema
└── hooks/                # Custom React hooks
    └── use-auth.ts       # Authentication hook
```

---

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### **Issues**
- `GET /api/issues` - List issues (with filtering/pagination)
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get single issue
- `PATCH /api/issues/[id]` - Update issue (owner only)
- `DELETE /api/issues/[id]` - Delete issue (owner only)
- `GET /api/issues/user` - Get user's issues

### **Voting**
- `POST /api/issues/[id]/vote` - Vote on issue
- `DELETE /api/issues/[id]/vote` - Remove vote

### **Utilities**
- `GET /api/map` - Get issues with coordinates
- `GET /api/analytics` - Get analytics data

---

## 🎨 **UI Components**

Built with **shadcn/ui** for consistency and accessibility:

- **Forms** - Input, Select, Textarea, Button
- **Navigation** - Navbar, Dropdown, Sheet
- **Data Display** - Card, Badge, Table, Charts
- **Feedback** - Toast, Alert, Skeleton
- **Layout** - Container, Grid, Flex

---

## 🔒 **Security Features**

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure session management
- **Rate Limiting** - Redis-based request limiting
- **Input Validation** - Zod schemas and Mongoose validation
- **XSS Protection** - React's built-in protection
- **CSRF Protection** - NextAuth.js built-in protection

---

## 📱 **Responsive Design**

- **Mobile-First** - Optimized for mobile devices
- **Breakpoints** - sm, md, lg, xl, 2xl
- **Touch-Friendly** - Large touch targets
- **Progressive Enhancement** - Works without JavaScript

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Other Platforms**
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Next.js Team** - For the amazing React framework
- **shadcn/ui** - For the beautiful component library
- **Vercel** - For the deployment platform
- **OpenStreetMap** - For the mapping data
- **Community Contributors** - For feedback and suggestions

---

## 📞 **Support**

- **Documentation** - [Wiki](https://github.com/inevitable-ank/Swachh/wiki)
- **Issues** - [GitHub Issues](https://github.com/inevitable-ank/Swachh/issues)
- **Discussions** - [GitHub Discussions](https://github.com/inevitable-ank/Swachh/discussions)
- **Email** - [Contact Us](mailto:support@swachhta.com)

---

<div align="center">

**Made with ❤️ for better communities**

[⬆ Back to Top](#-swachhta---civic-issue-reporting--management-platform)

</div>