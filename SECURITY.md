# Security Features

This application implements multiple layers of security to protect against common vulnerabilities and attacks.

## Implemented Security Measures

### 1. Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Account Lockout**: Automatic account lock after 5 failed login attempts (15-minute lockout)
- **Protected Routes**: Middleware-based route protection requiring valid JWT

### 2. Rate Limiting (DDoS Protection)
- **General API Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Route Rate Limit**: 5 login attempts per 15 minutes per IP
- Prevents brute force attacks and API abuse

### 3. Input Validation & Sanitization
- **Express Validator**: Comprehensive validation for all user inputs
- **MongoDB Injection Protection**: Sanitizes queries to prevent NoSQL injection
- **XSS Protection**: Cleans user input to prevent cross-site scripting
- **HPP Protection**: Prevents HTTP parameter pollution attacks
- **Request Size Limits**: 10KB limit on request bodies

### 4. Security Headers (Helmet.js)
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

### 5. CORS Configuration
- Restricted to specific origin (configurable via environment variable)
- Credentials support with proper origin validation

### 6. Data Validation
- **User Registration**: 
  - Username: 3-30 characters, alphanumeric + underscore only
  - Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- **Patient Data**: Validated names, dates, phone numbers, emails
- **Appointments**: Date validation, MongoDB ID validation
- **Notes**: Length restrictions (1-1000 characters)

### 7. Error Handling
- Centralized error handler
- No sensitive information leaked in error messages
- Different error responses for development vs production
- Proper HTTP status codes

### 8. Database Security
- Mongoose schema validation
- Unique constraints on sensitive fields
- Password field excluded from queries by default
- Proper indexing for performance

## Environment Variables

Required security-related environment variables:

```env
JWT_SECRET=<long-random-string-min-32-characters>
CLIENT_URL=<your-frontend-url>
NODE_ENV=production
```

## Best Practices for Deployment

### 1. Environment Configuration
- Use strong, random JWT_SECRET (minimum 32 characters)
- Set NODE_ENV=production in production
- Configure CLIENT_URL to your actual frontend domain
- Use MongoDB Atlas with IP whitelisting

### 2. HTTPS/TLS
- Always use HTTPS in production
- Configure SSL/TLS certificates
- Enable HSTS headers (already configured)

### 3. Database Security
- Use strong MongoDB credentials
- Enable MongoDB authentication
- Restrict database access by IP
- Regular backups

### 4. Monitoring & Logging
- Implement proper logging service (e.g., Winston, Morgan)
- Monitor for suspicious activity
- Set up alerts for rate limit violations
- Track failed login attempts

### 5. Regular Updates
- Keep all dependencies updated
- Monitor security advisories
- Run `npm audit` regularly
- Apply security patches promptly

### 6. Additional Recommendations
- Implement refresh tokens for better token management
- Add 2FA for admin accounts
- Implement session management
- Add API versioning
- Use a Web Application Firewall (WAF)
- Implement CAPTCHA for login after multiple failures
- Add audit logging for sensitive operations

## Vulnerability Reporting

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

## Security Checklist for Production

- [ ] Strong JWT_SECRET configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] MongoDB credentials secured
- [ ] IP whitelisting enabled
- [ ] Rate limiting tested
- [ ] Error messages don't leak sensitive info
- [ ] All dependencies updated
- [ ] Security headers verified
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
- [ ] Regular security audits scheduled

## Testing Security

Run security audit:
```bash
npm audit
```

Check for outdated packages:
```bash
npm outdated
```

Test rate limiting:
```bash
# Use tools like Apache Bench or Artillery
ab -n 200 -c 10 http://localhost:5000/api/patients
```

## Compliance

This application follows OWASP Top 10 security guidelines and implements protections against:
- Injection attacks
- Broken authentication
- Sensitive data exposure
- XML external entities (XXE)
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging & monitoring
