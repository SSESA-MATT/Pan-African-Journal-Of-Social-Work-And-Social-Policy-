# 🔄 Supabase Database Updates Required

## 📋 **Overview**

Based on the advanced features we've added to the manuscript management system, several database enhancements are needed to support:

- Advanced reviewer assignment with expertise matching
- Workflow tracking and audit trails  
- Messaging system between users
- Enhanced analytics and reporting
- Reviewer profiles and performance tracking

## 🚀 **Quick Setup Instructions**

### **Step 1: Run the Schema Updates**

1. Open your **Supabase Dashboard** at [supabase.com](https://supabase.com)
2. Navigate to your project → **SQL Editor**
3. Copy and paste the contents of `backend/src/database/schema_updates.sql`
4. Click **Run** to execute all the updates

### **Step 2: Verify Tables Created**

After running the updates, verify these new tables exist:

- ✅ `reviewer_expertise`
- ✅ `reviewer_profiles`
- ✅ `manuscript_workflow_history`
- ✅ `review_invitations`
- ✅ `messages`
- ✅ `system_metrics`
- ✅ `journal_settings`

## 📊 **New Database Features**

### **🎯 Advanced Reviewer Assignment**

- **Expertise matching**: Reviewers tagged with specialization areas
- **Availability tracking**: Real-time reviewer workload management
- **Performance metrics**: Average review time, completion rates
- **Smart matching**: AI-powered reviewer recommendations based on manuscript keywords

### **📨 Communication System**

- **Internal messaging**: Direct communication between authors, reviewers, editors
- **Manuscript-specific threads**: Organized conversations per submission
- **Notification tracking**: Read/unread status, message types

### **🔍 Workflow Tracking**

- **Audit trail**: Complete history of status changes and actions
- **Action logging**: Track who did what and when
- **Decision tracking**: Record editorial decisions and reasoning

### **📈 Analytics & Reporting**

- **Performance dashboards**: Review turnaround times, acceptance rates
- **System metrics**: Usage statistics, user activity
- **Journal insights**: Submission trends, geographic distribution

## 🛠️ **Updated API Endpoints Needed**

With these database changes, you'll need to update/create these API endpoints:

### **Reviewer Management**
```
GET /api/reviewers/expertise - Get reviewer expertise areas
POST /api/reviewers/profile - Update reviewer profile
GET /api/reviewers/workload - Get current review assignments
```

### **Advanced Assignment**  
```
GET /api/manuscripts/:id/potential-reviewers - Get matched reviewers
POST /api/manuscripts/:id/assign-reviewers - Assign multiple reviewers
GET /api/review-invitations - Manage review invitations
```

### **Messaging**
```
GET /api/messages - Get user messages
POST /api/messages - Send message
PUT /api/messages/:id/read - Mark as read
```

### **Analytics**
```
GET /api/analytics/dashboard - System analytics
GET /api/analytics/reviewer-performance - Reviewer metrics  
GET /api/analytics/manuscript-trends - Submission trends
```

## ⚡ **Performance Enhancements**

The updates include optimized indexes for:
- ✅ **Fast reviewer searches** by expertise and availability
- ✅ **Quick manuscript-reviewer matching** queries  
- ✅ **Efficient message retrieval** and filtering
- ✅ **Rapid workflow history** lookups

## 🔐 **Row Level Security (RLS)**

After running the schema updates, you should also set up RLS policies:

```sql
-- Enable RLS on new tables
ALTER TABLE reviewer_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_invitations ENABLE ROW LEVEL SECURITY;

-- Add policies for each table based on user roles
-- (Detailed policies should be created based on your access requirements)
```

## 📱 **Frontend Integration Ready**

Once these database updates are applied, all the advanced dashboard features will work:

- ✅ **Admin Reviewer Assignment** (`/admin/reviewer-assignment`)
- ✅ **Author Dashboard** with enhanced tracking (`/author`)  
- ✅ **Reviewer Dashboard** with workload management (`/reviewer`)
- ✅ **Advanced Analytics** and reporting
- ✅ **Messaging Center** for communication

## 🎉 **Next Steps**

1. **Apply database updates** using the provided SQL file
2. **Update backend API** to support new endpoints
3. **Test reviewer assignment** workflow  
4. **Configure email notifications** for review invitations
5. **Set up RLS policies** for data security

All the frontend components are already built and ready - they just need the backend database and API support! 🚀
