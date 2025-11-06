# Nginx Configuration for DigiStall

This directory contains the centralized Nginx configuration for handling traffic routing between the Web and Mobile frontends.

## Structure

```
nginx/
├── nginx.conf           # Main Nginx configuration
└── conf.d/
    ├── web-app.conf    # Vue.js web application config
    └── mobile-app.conf # React Native mobile application config
```

## Configuration Overview

### Main Configuration (`nginx.conf`)
- Worker process optimization
- Global rate limiting zones
- Gzip compression settings
- Upstream backend server definitions
- Security and performance settings

### Web App Configuration (`web-app.conf`)
- **Port**: 80
- **Server Name**: web.digistall.local, localhost
- **Root**: `/usr/share/nginx/html/web`
- **Backend**: `backend_web` (port 5000)
- **Features**:
  - Vue.js routing support
  - API proxying to backend
  - Static asset caching (1 year)
  - Rate limiting (30 req/s general, 15 req/s API)
  - Security headers
  - Health check endpoint

### Mobile App Configuration (`mobile-app.conf`)
- **Port**: 8080
- **Server Name**: mobile.digistall.local, localhost
- **Root**: `/usr/share/nginx/html/mobile`
- **Backend**: `backend_mobile` (port 5001)
- **Features**:
  - React Native Web routing support
  - API proxying to backend
  - Static asset caching (1 year)
  - Rate limiting (30 req/s general, 10 req/s API)
  - Security headers
  - Health check endpoint

## Rate Limiting

### General Traffic
- **Limit**: 30 requests/second
- **Burst**: 20-30 requests (varies by app)
- **Zone Size**: 10MB

### API Traffic
- **Limit**: 10-15 requests/second (varies by app)
- **Burst**: 10-15 requests
- **Zone Size**: 10MB

## Backend Upstream Servers

```nginx
upstream backend_web {
    server backend:5000;
}

upstream backend_mobile {
    server backend:5001;
}
```

## Health Checks

- **Web**: `http://localhost/health`
- **Mobile**: `http://localhost:8080/health`

## Deployment

### Docker Compose
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./Frontend/Web/dist:/usr/share/nginx/html/web:ro
      - ./Frontend/Mobile/dist:/usr/share/nginx/html/mobile:ro
    depends_on:
      - backend
```

### Testing Configuration
```bash
# Test nginx configuration
nginx -t

# Reload nginx
nginx -s reload
```

## Security Features

1. **Rate Limiting**: Prevents DDoS and brute force attacks
2. **Security Headers**: 
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: no-referrer-when-downgrade
3. **Request Size Limits**: 20MB max body size
4. **Timeouts**: 60s for proxy connections

## Performance Optimizations

1. **Gzip Compression**: Enabled for text-based files
2. **Static Asset Caching**: 1 year for immutable assets
3. **Sendfile**: Enabled for efficient file transfer
4. **Keepalive**: Connection reuse enabled
5. **Worker Connections**: 1024 per worker

## Notes

- Original configs are preserved in `Frontend/Mobile/nginx.conf` and `Frontend/Web/nginx.conf`
- SSL/HTTPS configuration is commented out in production section
- Adjust rate limits based on actual traffic patterns
- Update upstream server addresses for production deployment
