# SchoolConnect Management System - Database & API Specification

---

## 1. PUBLIC / ONBOARDING MODULE

### Database Tables

#### `contacts`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| name | VARCHAR | Yes | - | Contact person name |
| email | VARCHAR | Yes | - | Contact email |
| phone | VARCHAR | No | null | Phone number |
| message | TEXT | No | null | Message content |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |
| schoolId | UUID | No | null | Associated school (if exists) |

**Primary Key:** `id`  
**Foreign Keys:** `schoolId` → `schools(id)` (nullable)

---

### APIs

#### Register School
- **HTTP:** `POST /api/public/register-school`
- **Auth:** No
- **Purpose:** Register new school with admin user

**Request Payload:**
```json
{
  "name": "School Name",
  "email": "admin@school.com",
  "password": "password123",
  "address": "School Address",
  "contact": "+1234567890",
  "logoUrl": "https://example.com/logo.png"
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "school": {
    "id": "uuid",
    "name": "School Name",
    "email": "admin@school.com",
    "provisioningStatus": "active"
  },
  "admin": {
    "id": "uuid",
    "email": "admin@school.com",
    "role": "admin"
  }
}
```

**Error Scenarios:**
- **400:** School email already exists
- **400:** Validation errors (weak password, invalid email)

---

#### Tenant Status Check
- **HTTP:** `GET /api/public/tenant-status/:subdomain`
- **Auth:** No
- **Purpose:** Check school provisioning status by subdomain

**Request Payload:** None (subdomain in URL)

**Success Response:**
- **Status:** `200`
```json
{
  "status": "active",
  "school": {
    "id": "uuid",
    "name": "School Name"
  }
}
```

**Error Scenarios:**
- **404:** Subdomain not found

---

#### Contact Form Submission
- **HTTP:** `POST /api/public/contact`
- **Auth:** No
- **Purpose:** Submit contact/demo request

**Request Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Interested in demo"
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "message": "Contact request received"
}
```

**Error Scenarios:**
- **400:** Validation errors

---

## 2. SCHOOL / TENANT MODULE

### Database Tables

#### `schools`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| name | VARCHAR | Yes | - | School name |
| email | VARCHAR | Yes | - | School contact email |
| address | VARCHAR | No | null | School address |
| contact | VARCHAR | No | null | Phone number |
| logoUrl | VARCHAR | No | null | Logo URL |
| academicYear | VARCHAR | No | null | Current academic year |
| timezone | VARCHAR | No | null | School timezone |
| notificationPreferences | JSON | No | null | Notification settings |
| provisioningStatus | VARCHAR | Yes | 'active' | Status: active/inactive |

**Primary Key:** `id`  
**Relationships:**
- One-to-many with `users`
- One-to-many with `classes`
- One-to-many with `subjects`
- One-to-many with `contacts`

---

### APIs

#### Get School Settings
- **HTTP:** `GET /api/admin/settings`
- **Auth:** Yes, Admin
- **Purpose:** Retrieve school settings

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "name": "School Name",
  "academicYear": "2025-2026",
  "timezone": "America/New_York",
  "logoUrl": "https://example.com/logo.png",
  "notificationPreferences": {}
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** School not found

---

#### Update School Settings
- **HTTP:** `PUT /api/admin/settings`
- **Auth:** Yes, Admin
- **Purpose:** Update school settings

**Request Payload:**
```json
{
  "academicYear": "2025-2026",
  "timezone": "America/New_York",
  "schoolLogoUrl": "https://example.com/logo.png",
  "notificationPreferences": {}
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "name": "School Name",
  "academicYear": "2025-2026",
  "timezone": "America/New_York"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **400:** Validation errors

---

## 3. AUTHENTICATION MODULE

### Database Tables

#### `users`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| fullName | VARCHAR(255) | No | null | Full name |
| email | VARCHAR(255) | No | null | Email address |
| passwordHash | VARCHAR(255) | No | null | Bcrypt hashed password |
| phone | VARCHAR(20) | No | null | Phone number |
| role | ENUM | Yes | 'admin' | admin/teacher/student/staff |
| schoolId | UUID | No | null | School reference |
| emailVerified | BOOLEAN | Yes | false | Email verification status |
| lastLogin | TIMESTAMP | No | null | Last login timestamp |
| isActive | BOOLEAN | Yes | true | Account active status |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |
| updatedAt | TIMESTAMP | Yes | now() | Update timestamp |
| deletedAt | TIMESTAMP | No | null | Soft delete timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `schoolId` → `schools(id)` (nullable, SET NULL on delete)  
**Indexes:**
- Unique: `(schoolId, email)`
- Index: `(schoolId, role)`
- Index: `(role)`

---

### APIs

#### Admin Login
- **HTTP:** `POST /api/admin/auth/login`
- **Auth:** No
- **Purpose:** Admin authentication with email/password

**Request Payload:**
```json
{
  "email": "admin@school.com",
  "password": "password123"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "fullName": "Admin Name",
    "email": "admin@school.com",
    "role": "admin",
    "school": {
      "id": "uuid",
      "name": "School Name"
    }
  }
}
```

**Error Scenarios:**
- **401:** Invalid credentials
- **400:** School inactive

---

#### Refresh Token
- **HTTP:** `POST /api/admin/auth/refresh`
- **Auth:** No (requires refresh token)
- **Purpose:** Get new access token using refresh token

**Request Payload:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token",
  "user": {
    "id": "uuid",
    "email": "admin@school.com",
    "role": "admin"
  }
}
```

**Error Scenarios:**
- **401:** Invalid/expired refresh token

---

#### Teacher Login
- **HTTP:** `POST /api/teacher/auth/login`
- **Auth:** No
- **Purpose:** Teacher authentication with email/password

**Request Payload:**
```json
{
  "email": "teacher@school.com",
  "password": "password123"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "fullName": "Teacher Name",
    "email": "teacher@school.com",
    "role": "teacher",
    "school": {
      "id": "uuid",
      "name": "School Name"
    }
  },
  "teacherProfile": {
    "id": "uuid",
    "phone": "+1234567890",
    "subjects": []
  }
}
```

**Error Scenarios:**
- **401:** Invalid credentials or not a teacher
- **400:** School inactive

---

#### Admin Dashboard
- **HTTP:** `GET /api/admin/dashboard`
- **Auth:** Yes, Admin
- **Purpose:** Get dashboard summary statistics

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
{
  "schoolId": "uuid",
  "totalStudents": 150,
  "totalClasses": 10,
  "totalTeachers": 15,
  "recentStudents": [
    {
      "id": "uuid",
      "name": "Student Name",
      "rollNo": "RN-001",
      "className": "Grade 5A"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

## 4. TEACHER MODULE

### Database Tables

#### `teacher_profiles`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| userId | UUID | Yes | - | Reference to users table |
| schoolId | UUID | Yes | - | School reference |
| phone | VARCHAR | No | null | Teacher phone number |

**Primary Key:** `id`  
**Foreign Keys:**
- `userId` → `users(id)`
- `schoolId` → `schools(id)`

#### `teacher_subjects` (Join Table)
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| teacherId | UUID | Yes | - | Teacher profile ID |
| subjectId | UUID | Yes | - | Subject ID |

**Composite Key:** `(teacherId, subjectId)`  
**Foreign Keys:**
- `teacherId` → `teacher_profiles(id)`
- `subjectId` → `subjects(id)`

---

### APIs

#### Create Teacher
- **HTTP:** `POST /api/admin/teachers`
- **Auth:** Yes, Admin
- **Purpose:** Create new teacher with profile

**Request Payload:**
```json
{
  "email": "teacher@school.com",
  "fullName": "Jane Doe",
  "phone": "+1234567890",
  "subjects": ["uuid-subject-1", "uuid-subject-2"],
  "classTeacher": "uuid-class-id",
  "assignClassSubjects": [
    {
      "classId": "uuid-class-1",
      "subjectId": "uuid-subject-1"
    }
  ]
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "email": "teacher@school.com",
    "fullName": "Jane Doe",
    "role": "teacher"
  },
  "phone": "+1234567890",
  "subjects": []
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **400:** Email already exists
- **404:** Class or subject not found

---

#### List Teachers
- **HTTP:** `GET /api/admin/teachers?page=1&limit=20&search=&classId=&subject=`
- **Auth:** Yes, Admin
- **Purpose:** Get paginated list of teachers

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Jane Doe",
      "email": "teacher@school.com",
      "phone": "+1234567890",
      "subjects": ["Math", "Science"],
      "classes": [
        {
          "classId": "uuid",
          "className": "Grade 5A",
          "subject": "Math",
          "isClassTeacher": false
        }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

#### Update Teacher
- **HTTP:** `PUT /api/admin/teachers/:id`
- **Auth:** Yes, Admin
- **Purpose:** Update teacher details

**Request Payload:**
```json
{
  "fullName": "Jane Smith",
  "phone": "+1234567890",
  "subjects": ["uuid-subject-1"],
  "assignClassSubjects": [
    {
      "classId": "uuid-class-1",
      "subjectId": "uuid-subject-1"
    }
  ]
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "fullName": "Jane Smith",
  "email": "teacher@school.com"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Teacher not found

---

#### Resend Teacher Invite
- **HTTP:** `POST /api/admin/teachers/:id/resend-invite`
- **Auth:** Yes, Admin
- **Purpose:** Resend invitation email to teacher

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
{
  "message": "Invite sent successfully"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Teacher not found

---

#### Get Teacher's Classes
- **HTTP:** `GET /api/teacher/class`
- **Auth:** Yes, Teacher
- **Purpose:** Get classes assigned to authenticated teacher

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
{
  "classes": [
    {
      "classId": "uuid",
      "className": "Grade 5A",
      "section": "A",
      "subjectId": "uuid",
      "subjectName": "Math",
      "isClassTeacher": true,
      "studentCount": 30
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

## 5. CLASS MODULE

### Database Tables

#### `classes`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| name | VARCHAR | Yes | - | Class name (e.g., "Grade 5") |
| section | VARCHAR | No | null | Section (e.g., "A") |
| schoolId | UUID | Yes | - | School reference |

**Primary Key:** `id`  
**Foreign Keys:** `schoolId` → `schools(id)`

#### `class_teacher_assignments`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| classId | UUID | Yes | - | Class reference |
| teacherId | UUID | No | null | Teacher profile reference |
| subjectId | UUID | No | null | Subject reference |
| isClassTeacher | BOOLEAN | Yes | false | Is homeroom teacher |
| schoolId | UUID | Yes | - | School reference |

**Primary Key:** `id`  
**Foreign Keys:**
- `classId` → `classes(id)` (CASCADE)
- `teacherId` → `teacher_profiles(id)` (SET NULL)
- `subjectId` → `subjects(id)` (SET NULL)
- `schoolId` → `schools(id)` (CASCADE)  
**Unique Constraint:** `(classId, teacherId, subjectId)`

---

### APIs

#### Create Class
- **HTTP:** `POST /api/admin/classes`
- **Auth:** Yes, Admin
- **Purpose:** Create new class

**Request Payload:**
```json
{
  "name": "Grade 5",
  "section": "A",
  "teacherId": "uuid",
  "subjectId": "uuid"
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "name": "Grade 5",
  "section": "A",
  "schoolId": "uuid"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **400:** Validation errors
- **404:** Teacher or subject not found

---

#### List Classes
- **HTTP:** `GET /api/admin/classes?name=&section=`
- **Auth:** Yes, Admin
- **Purpose:** Get all classes for school

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Grade 5",
      "section": "A",
      "studentCount": 30,
      "teachers": [
        {
          "teacherId": "uuid",
          "teacherName": "Jane Doe",
          "subjectName": "Math",
          "isClassTeacher": true
        }
      ]
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

#### Update Class
- **HTTP:** `PUT /api/admin/classes/:id`
- **Auth:** Yes, Admin
- **Purpose:** Update class details

**Request Payload:**
```json
{
  "name": "Grade 6",
  "section": "B"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "name": "Grade 6",
  "section": "B"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Class not found

---

#### Assign Teacher to Class
- **HTTP:** `POST /api/admin/classes/:id/assign-teacher`
- **Auth:** Yes, Admin
- **Purpose:** Assign teacher to class

**Request Payload:**
```json
{
  "teacherId": "uuid"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "message": "Teacher assigned successfully"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Class or teacher not found

---

## 6. SUBJECT MODULE

### Database Tables

#### `subjects`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| name | VARCHAR | Yes | - | Subject name |
| code | VARCHAR | No | null | Subject code |
| schoolId | UUID | Yes | - | School reference |
| deletedAt | TIMESTAMPTZ | No | null | Soft delete timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `schoolId` → `schools(id)`  
**Unique Constraint:** `(schoolId, code)`  
**Indexes:**
- `(schoolId, deletedAt)`

---

### APIs

#### Create Subject
- **HTTP:** `POST /api/admin/subjects`
- **Auth:** Yes, Admin
- **Purpose:** Create new subject

**Request Payload:**
```json
{
  "name": "Mathematics",
  "code": "MATH-101"
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "name": "Mathematics",
  "code": "MATH-101",
  "schoolId": "uuid"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **409:** Subject code already exists

---

#### List Subjects
- **HTTP:** `GET /api/admin/subjects?search=&includeDeleted=false`
- **Auth:** Yes, Admin
- **Purpose:** Get all subjects for school

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Mathematics",
      "code": "MATH-101",
      "schoolId": "uuid"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

#### Update Subject
- **HTTP:** `PUT /api/admin/subjects/:id`
- **Auth:** Yes, Admin
- **Purpose:** Update subject details

**Request Payload:**
```json
{
  "name": "Advanced Mathematics",
  "code": "MATH-201"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "name": "Advanced Mathematics",
  "code": "MATH-201"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Subject not found
- **409:** Code already exists

---

#### Delete Subject
- **HTTP:** `DELETE /api/admin/subjects/:id`
- **Auth:** Yes, Admin
- **Purpose:** Soft delete subject

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
{
  "message": "Subject deleted successfully"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Subject not found

---

## 7. STUDENT MODULE

### Database Tables

#### `students`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| name | VARCHAR | Yes | - | Student name |
| rollNo | VARCHAR | No | null | Roll number |
| classId | UUID | Yes | - | Current class reference |
| schoolId | UUID | Yes | - | School reference |
| photoUrl | VARCHAR | No | null | Photo URL |
| enrollmentDate | DATE | No | null | Enrollment date |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |

**Primary Key:** `id`  
**Foreign Keys:**
- `classId` → `classes(id)` (RESTRICT)
- `schoolId` → `schools(id)` (RESTRICT)

---

### APIs

#### Create Student
- **HTTP:** `POST /api/admin/students`
- **Auth:** Yes, Admin
- **Purpose:** Create new student

**Request Payload:**
```json
{
  "name": "John Doe",
  "rollNo": "RN-001",
  "classId": "uuid",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "rollNo": "RN-001",
  "classId": "uuid",
  "schoolId": "uuid"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Class not found
- **400:** Validation errors

---

#### Import Students (CSV/Excel)
- **HTTP:** `POST /api/admin/students/import`
- **Auth:** Yes, Admin
- **Purpose:** Bulk import students from file

**Request Payload:** Multipart form-data with file

**Success Response:**
- **Status:** `201`
```json
{
  "imported": 50,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Invalid class ID"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **400:** File format not supported

---

#### List Students
- **HTTP:** `GET /api/admin/students?page=1&limit=20&search=&classId=`
- **Auth:** Yes, Admin
- **Purpose:** Get paginated list of students

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "John Doe",
      "rollNo": "RN-001",
      "className": "Grade 5A",
      "photoUrl": "https://example.com/photo.jpg"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

#### Update Student
- **HTTP:** `PUT /api/admin/students/:id`
- **Auth:** Yes, Admin
- **Purpose:** Update student details

**Request Payload:**
```json
{
  "name": "John Smith",
  "rollNo": "RN-002",
  "classId": "uuid",
  "photoUrl": "https://example.com/photo2.jpg"
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "name": "John Smith",
  "rollNo": "RN-002"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Student not found

---

## 8. ATTENDANCE MODULE

### Database Tables

#### `attendances`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| schoolId | UUID | Yes | - | School reference |
| classId | UUID | Yes | - | Class reference |
| date | DATE | Yes | - | Attendance date |
| markedBy | UUID | Yes | - | User who marked attendance |
| status | ENUM | Yes | 'MARKED' | Status: MARKED |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |
| updatedAt | TIMESTAMP | Yes | now() | Update timestamp |

**Primary Key:** `id`  
**Unique Constraint:** `(schoolId, classId, date)`  
**Indexes:** `(schoolId, classId, date)`

#### `attendance_students`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| attendanceId | UUID | Yes | - | Attendance record reference |
| studentId | UUID | Yes | - | Student reference |
| status | ENUM | Yes | - | PRESENT/ABSENT |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `attendanceId` → `attendances(id)` (CASCADE)  
**Unique Constraint:** `(attendanceId, studentId)`

---

### APIs

#### Create Attendance
- **HTTP:** `POST /api/attendance`
- **Auth:** Yes, Teacher/Admin
- **Purpose:** Mark attendance for class and date

**Request Payload:**
```json
{
  "classId": "uuid",
  "date": "2025-12-17",
  "students": [
    {
      "studentId": "uuid",
      "status": "PRESENT"
    },
    {
      "studentId": "uuid",
      "status": "ABSENT"
    }
  ]
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "classId": "uuid",
  "date": "2025-12-17",
  "markedBy": "uuid",
  "status": "MARKED",
  "students": [
    {
      "studentId": "uuid",
      "status": "PRESENT"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **403:** Not authorized to mark for this class
- **409:** Attendance already marked for this date

---

#### Get Attendance
- **HTTP:** `GET /api/attendance?classId=uuid&date=2025-12-17`
- **Auth:** Yes, Teacher/Admin
- **Purpose:** Get attendance for specific class and date

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "classId": "uuid",
  "date": "2025-12-17",
  "markedBy": "uuid",
  "students": [
    {
      "studentId": "uuid",
      "studentName": "John Doe",
      "status": "PRESENT"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Attendance not found

---

#### Update Attendance
- **HTTP:** `PUT /api/attendance/:attendanceId`
- **Auth:** Yes, Teacher/Admin
- **Purpose:** Update existing attendance record

**Request Payload:**
```json
{
  "date": "2025-12-18",
  "students": [
    {
      "studentId": "uuid",
      "status": "ABSENT"
    }
  ]
}
```

**Success Response:**
- **Status:** `200`
```json
{
  "id": "uuid",
  "classId": "uuid",
  "date": "2025-12-18",
  "students": [
    {
      "studentId": "uuid",
      "status": "ABSENT"
    }
  ]
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **403:** Not authorized to update
- **404:** Attendance not found

---

#### Get Class Attendance History
- **HTTP:** `GET /api/attendance/class/:classId?from=2025-12-01&to=2025-12-31`
- **Auth:** Yes, Teacher/Admin
- **Purpose:** Get attendance history for a class

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
[
  {
    "id": "uuid",
    "date": "2025-12-17",
    "markedBy": "uuid",
    "totalPresent": 28,
    "totalAbsent": 2
  }
]
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Class not found

---

#### Get Student Attendance History
- **HTTP:** `GET /api/attendance/student/:studentId`
- **Auth:** Yes, Teacher/Admin
- **Purpose:** Get attendance history for a student

**Request Payload:** None

**Success Response:**
- **Status:** `200`
```json
[
  {
    "date": "2025-12-17",
    "status": "PRESENT",
    "className": "Grade 5A"
  },
  {
    "date": "2025-12-16",
    "status": "ABSENT",
    "className": "Grade 5A"
  }
]
```

**Error Scenarios:**
- **401:** Unauthorized
- **404:** Student not found

---

## 9. ANNOUNCEMENT MODULE

### Database Tables

#### `announcements`
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | Yes | gen | Primary key |
| title | VARCHAR | Yes | - | Announcement title |
| message | TEXT | Yes | - | Announcement content |
| targetClassId | UUID | No | null | Target class (null = school-wide) |
| schoolId | UUID | Yes | - | School reference |
| attachments | JSON | No | null | Array of {filename, url} |
| createdByUserId | UUID | Yes | - | Creator user ID |
| createdAt | TIMESTAMP | Yes | now() | Creation timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `schoolId` → `schools(id)` (CASCADE)

---

### APIs

#### Create Announcement
- **HTTP:** `POST /api/admin/announcements`
- **Auth:** Yes, Admin
- **Purpose:** Create school or class announcement

**Request Payload:**
```json
{
  "title": "Holiday Notice",
  "message": "School will be closed tomorrow",
  "audience": "all",
  "attachments": [
    {
      "filename": "notice.pdf",
      "url": "https://example.com/notice.pdf"
    }
  ]
}
```

**Success Response:**
- **Status:** `201`
```json
{
  "id": "uuid",
  "title": "Holiday Notice",
  "message": "School will be closed tomorrow",
  "targetClassId": null,
  "schoolId": "uuid",
  "createdByUserId": "uuid",
  "createdAt": "2025-12-17T10:00:00Z"
}
```

**Error Scenarios:**
- **401:** Unauthorized
- **400:** Validation errors
- **404:** Target class not found

---

#### List Announcements
- **HTTP:** `GET /api/admin/announcements?page=1&limit=20&classId=`
- **Auth:** Yes, Admin
- **Purpose:** Get paginated list of announcements

**Request Payload:** Query params only

**Success Response:**
- **Status:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Holiday Notice",
      "message": "School will be closed tomorrow",
      "targetClassId": null,
      "createdAt": "2025-12-17T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**Error Scenarios:**
- **401:** Unauthorized

---

## GLOBAL NOTES

### Authentication Flow
1. All authenticated endpoints require `Authorization: Bearer <jwt-token>` header
2. Access tokens expire in 15 minutes
3. Refresh tokens expire in 7 days
4. Passwords hashed using bcrypt (saltRounds = 10)

### Authorization Roles
- **Admin:** Full access to school data and settings
- **Teacher:** Access to assigned classes, students, and attendance
- **Staff:** Limited access (future scope)
- **Student:** Read-only access (future scope)

### Multi-Tenancy
- All data scoped by `schoolId`
- Guards validate school context on every request
- School status must be 'active' for operations

### Data Validation
- All UUIDs validated using class-validator `@IsUUID('4')`
- Dates in ISO format `YYYY-MM-DD`
- Email validation using `@IsEmail()`
- Pagination defaults: page=1, limit=20

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Soft Deletes
- Users: `deletedAt` column
- Subjects: `deletedAt` column
- Other entities use hard deletes or CASCADE

---

**End of Specification**
