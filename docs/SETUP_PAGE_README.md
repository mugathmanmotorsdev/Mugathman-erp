# Setup Page Documentation

## Overview
The `/setup` page is a one-time initialization page for creating the initial manager account in the Mugathman Motors ERP system. This page should only be accessible when no users exist in the database.

## Features

### 🎨 Modern UI/UX
- **Gradient Background**: Beautiful gradient from indigo to purple
- **Smooth Animations**: Fade-in, slide-up, and shake animations
- **Responsive Design**: Works perfectly on all screen sizes
- **Password Strength Indicator**: Real-time visual feedback on password strength
- **Toggle Password Visibility**: Eye icons to show/hide passwords

### 🔒 Security Features
- **Password Hashing**: Uses bcrypt with 10 salt rounds
- **Password Validation**: Minimum 8 characters required
- **Email Validation**: Proper email format checking
- **One-Time Setup**: Prevents multiple manager accounts
- **Secure API Endpoint**: Server-side validation and error handling

### ✅ Form Validation
- All fields required
- Email format validation
- Password length validation (min 8 characters)
- Password confirmation matching
- Real-time password strength calculation

### 📊 Password Strength Levels
1. **Weak** (Red) - Basic password
2. **Fair** (Orange) - Meets minimum requirements
3. **Good** (Yellow) - Includes mixed case
4. **Strong** (Green) - Includes numbers
5. **Very Strong** (Emerald) - Includes special characters

## Usage

### First Time Setup

1. **Navigate to Setup Page**
   ```
   http://localhost:3000/setup
   ```

2. **Fill in Manager Details**
   - Full Name: Your full name
   - Email: Valid email address
   - Password: Strong password (min 8 characters)
   - Confirm Password: Re-enter password

3. **Submit**
   - Click "Create Manager Account"
   - Wait for success message
   - Automatic redirect to home page

### Setup Status Check

The page automatically checks if setup is required:
- If users exist: Shows "Setup Already Completed" and redirects
- If no users: Shows the setup form
- Loading state while checking

## API Endpoints

### POST `/api/setup`
Creates the initial manager account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "manager@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Manager account created successfully",
  "data": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "manager@example.com",
    "role": "MANAGER",
    "created_at": "2026-01-16T17:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing or invalid fields
- `403`: Setup already completed
- `409`: Email already exists
- `500`: Internal server error

### GET `/api/setup`
Checks if setup is required.

**Response:**
```json
{
  "success": true,
  "setupRequired": true,
  "message": "Setup is required"
}
```

## Database Schema

The User model includes:
```prisma
model User {
  id         String   @id @default(uuid()) @db.Uuid
  full_name  String
  email      String   @unique
  password   String   // Hashed with bcrypt
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  role       RoleName @default(VIEWER)
  
  // Relations...
}
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **One-Time Setup**: The API prevents creating multiple manager accounts
3. **Input Validation**: Both client-side and server-side validation
4. **HTTPS Recommended**: Use HTTPS in production
5. **Environment Variables**: Ensure DATABASE_URL is properly configured

## Customization

### Changing Password Requirements
Edit `/app/setup/page.tsx` and `/app/api/setup/route.ts`:
```typescript
// Minimum password length
if (password.length < 12) { // Change from 8 to 12
  // ...
}
```

### Changing Password Strength Algorithm
Edit the `calculateStrength` function in `/app/setup/page.tsx`:
```typescript
const calculateStrength = (password: string) => {
  let score = 0;
  // Add your custom rules here
};
```

### Styling
The page uses Tailwind CSS. Modify classes in `/app/setup/page.tsx`:
- Background gradient: `bg-gradient-to-br from-indigo-50 via-white to-purple-50`
- Button gradient: `bg-gradient-to-r from-indigo-600 to-purple-600`
- Card shadow: `shadow-2xl`

## Troubleshooting

### "Setup Already Completed" Error
- This means a user already exists in the database
- To reset: Delete all users from the database (development only)
- Run: `npx prisma studio` to manage database

### Database Connection Error
- Check `DATABASE_URL` in `.env` or `.env.local`
- Ensure PostgreSQL is running
- Verify database exists

### Password Not Hashing
- Ensure `bcryptjs` is installed: `npm install bcryptjs`
- Check `/lib/password.ts` exists and is correct

### TypeScript Errors
- Run: `npx prisma generate` to regenerate Prisma client
- Restart TypeScript server in your IDE

## Files Created/Modified

### New Files
1. `/app/setup/page.tsx` - Setup page component
2. `/app/api/setup/route.ts` - API endpoint
3. `/lib/password.ts` - Password utilities
4. `/middleware.ts` - Middleware (fixed)

### Modified Files
1. `/prisma/schema.prisma` - Added password field
2. `/app/globals.css` - Added custom animations

### Dependencies Added
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types

## Next Steps

After setup is complete:
1. Update NextAuth configuration to use database authentication
2. Create login page
3. Implement user management (manager can create other users)
4. Add role-based access control
5. Implement password reset functionality

## Production Deployment

Before deploying to production:
1. ✅ Ensure HTTPS is enabled
2. ✅ Set strong environment variables
3. ✅ Run database migrations: `npx prisma migrate deploy`
4. ✅ Test the setup flow thoroughly
5. ✅ Consider adding rate limiting to the API
6. ✅ Add logging for security events
7. ✅ Implement email verification (optional)

## Support

For issues or questions:
- Check the console for error messages
- Review the API response in Network tab
- Ensure all dependencies are installed
- Verify database connection

---

**Created**: January 16, 2026  
**Version**: 1.0.0  
**Author**: Mugathman Motors Development Team
