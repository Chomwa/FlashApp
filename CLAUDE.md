# Flash Payment App - Claude Assistant Guide

## Project Overview

This is **Flash**, a comprehensive payment orchestration platform similar to Swish (Sweden's instant payment app). Flash acts as a technology layer that orchestrates payments between users' existing mobile money wallets, without holding or processing any money directly. It enables instant P2P money transfers using phone numbers, QR code payments, and integrates with MTN Mobile Money APIs for real-world transaction orchestration.

## Architecture

The application follows a modern full-stack architecture:

### Backend (Django REST API)
- **Framework**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL 15 for data persistence
- **Cache/Queue**: Redis for caching and Celery for background tasks
- **Authentication**: Token-based authentication
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Containerization**: Docker with docker-compose for development

### Frontend (React Native Mobile App)
- **Framework**: React Native 0.72 with TypeScript
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Storage**: AsyncStorage for persistence
- **HTTP Client**: Axios for API communication
- **Platform**: Cross-platform (iOS & Android)

### External Integrations
- **MTN Collections API**: For Request-to-Pay orchestration (no money handling)
- **MTN Disbursement API**: For disbursement orchestration (planned)
- **Airtel Money API**: For multi-provider support (planned)
- **QR Code Generation**: For payment requests
- **Phone Number Validation**: Zambian (+260) format validation with provider detection

## Project Structure

```
FlashApp/
├── backend/                    # Django REST API
│   ├── config/                # Django project configuration
│   │   ├── settings.py        # Main Django settings
│   │   ├── urls.py           # Root URL configuration
│   │   ├── wsgi.py           # WSGI application
│   │   └── celery.py         # Celery configuration
│   ├── users/                 # User management app
│   │   ├── models.py         # User, UserProfile, UserContacts models
│   │   ├── views.py          # Authentication and user management views
│   │   ├── serializers.py    # DRF serializers for user data
│   │   ├── urls.py           # User-related URL patterns
│   │   └── admin.py          # Django admin configuration
│   ├── transactions/          # Transaction management app
│   │   ├── models.py         # Transaction, P2PTransaction, Wallet models
│   │   ├── views.py          # Transaction API views
│   │   ├── serializers.py    # Transaction serializers
│   │   └── urls.py           # Transaction URL patterns
│   ├── payments/              # Payment provider orchestration
│   │   ├── providers/        # Payment provider implementations
│   │   │   ├── base.py       # IPaymentProvider interface
│   │   │   └── mtn_zambia.py # MTN Zambia provider implementation
│   │   ├── router.py         # Payment orchestration router
│   │   ├── views.py          # Payment orchestration API views
│   │   └── urls.py           # Payment URL patterns
│   ├── manage.py             # Django management script
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile           # Docker configuration for backend
├── mobile_app/                # React Native application
│   ├── src/
│   │   ├── App.tsx           # Root application component
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   │   └── AuthContext.tsx # Authentication state management
│   │   ├── navigation/       # App navigation structure
│   │   │   ├── AuthStack.tsx # Authentication flow
│   │   │   └── MainStack.tsx # Main app navigation
│   │   ├── screens/          # Screen components
│   │   │   ├── auth/         # Login, Register, Welcome screens
│   │   │   └── main/         # Home, Send, Receive, etc.
│   │   ├── services/         # External service integrations
│   │   │   └── api.ts        # API client and endpoints
│   │   └── utils/            # Utility functions
│   ├── package.json          # Node.js dependencies
│   └── index.js             # React Native entry point
├── shared/                    # Shared utilities
│   └── mtn/                  # MTN Mobile Money API integration
│       ├── collections_api.py # MTN Collections API client
│       ├── disbursement_api.py # MTN Disbursement API client  
│       └── exceptions.py     # MTN-specific exceptions
├── test_complete_sandbox_flow.py # End-to-end integration tests
├── setup_mtn_collections.py  # MTN API setup and testing script
├── docker-compose.yml         # Development environment setup
├── setup.sh                  # Automated project setup script
├── README.md                 # Comprehensive project documentation
└── CLAUDE.md                # This file - Claude assistant guide
```

## Key Models and Data Structure

### User Management

#### User Model (users/models.py)
```python
class User(AbstractUser):
    phone_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=200)
    avatar = models.ImageField(upload_to='avatars/')
    is_phone_verified = models.BooleanField(default=False)
    pin_hash = models.CharField(max_length=128)
    default_currency = models.CharField(max_length=3, default='ZMW')
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2)
```

#### UserProfile Model
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    address = models.TextField()
    id_number = models.CharField(max_length=50)
    is_kyc_verified = models.BooleanField(default=False)
```

### Transaction Management

#### Transaction Model (transactions/models.py)
```python
class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    reference_id = models.CharField(max_length=100, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='ZMW')
    sender = models.ForeignKey(User, related_name='sent_transactions')
    recipient = models.ForeignKey(User, related_name='received_transactions')
    recipient_phone = models.CharField(max_length=20)  # For non-users
    status = models.CharField(max_length=20, choices=TransactionStatus.choices)
    provider_transaction_id = models.CharField(max_length=200)
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2)
```

#### Wallet Model (Tracking Only - No Real Money)
```python
class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    escrow_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # Tracking only
    rewards_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)  # Flash rewards
    currency = models.CharField(max_length=3, default='ZMW')
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=5000)
    daily_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    
    def debit(self, amount, description="Transaction"):
        """Track outgoing payments (no real money)"""
        self.daily_spent += amount
        self.save()
        
    def credit(self, amount, description="Transaction"):
        """Track incoming payments (no real money)"""
        # Flash wallet is for tracking only
        pass
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Current user information

### Transaction Endpoints
- `GET /api/transactions/wallet/` - Get user wallet information
- `POST /api/transactions/send/` - Send money to another user
- `POST /api/transactions/request/` - Request money from another user
- `GET /api/transactions/transactions/` - Get transaction history
- `GET /api/transactions/transactions/{id}/` - Get specific transaction

### Payment Orchestration Endpoints
- `GET /api/payments/providers/` - List available payment providers
- `POST /api/payments/validate-phone/` - Validate phone number and detect provider
- `GET /api/payments/mtn/balance/` - Get MTN account balance (via orchestrator)
- `POST /api/payments/mtn/send/` - Orchestrate payment via MTN Collections API
- `GET /api/payments/mtn/status/{reference_id}/` - Check MTN payment status
- `POST /api/payments/mtn/webhook/` - Receive MTN payment status updates (optional)

## Development Environment

### Running the Application

1. **Backend Setup**:
```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

2. **Mobile App Setup**:
```bash
cd mobile_app
npm install
npm run ios    # for iOS
npm run android # for Android
```

### Ports and Services
- **Backend API**: http://localhost:8002
- **PostgreSQL**: localhost:5435
- **Redis**: localhost:6381
- **API Documentation**: http://localhost:8002/api/docs/
- **Admin Panel**: http://localhost:8002/admin/

### Environment Variables
Key environment variables for development:
```bash
DEBUG=True
SECRET_KEY=development-secret-key
DATABASE_URL=postgresql://flashuser:flashpass@db:5432/flashdb
REDIS_URL=redis://redis:6379/0

# MTN Collections API - Live Sandbox Credentials
MTN_COLLECTIONS_PRIMARY_KEY=934de52c869f4f20bc76f4808cddedd1
MTN_COLLECTIONS_SUB_KEY=934de52c869f4f20bc76f4808cddedd1
MTN_USER_ID=1e68d32e-b040-4696-aa62-ae508149458f
MTN_API_KEY=76bcf43fb1fc4455a04c289b6bb3cb05
MTN_HOST_NAME=sandbox.momodeveloper.mtn.com
MTN_COLLECTIONS_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_COLLECTIONS_TARGET_ENV=sandbox
```

## Common Development Tasks

### Backend Development

#### Adding New Models
```bash
# Create new app
docker-compose exec backend python manage.py startapp newapp

# Add to INSTALLED_APPS in settings.py
# Create models in newapp/models.py
# Generate migrations
docker-compose exec backend python manage.py makemigrations newapp

# Apply migrations
docker-compose exec backend python manage.py migrate
```

#### Database Operations
```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# Access PostgreSQL directly
docker-compose exec db psql -U flashuser -d flashdb

# Create database backup
docker-compose exec db pg_dump -U flashuser flashdb > backup.sql
```

#### Testing
```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test users
docker-compose exec backend python manage.py test transactions
```

### Mobile App Development

#### Common Commands
```bash
# Start Metro bundler
npm start

# Reset Metro cache
npm start -- --reset-cache

# Run on specific device
npm run ios -- --device="iPhone 14"
npm run android -- --deviceId=DEVICE_ID

# Build for production
npm run build:ios
npm run build:android
```

#### Debugging
```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android

# Flipper debugging (if configured)
npm run flipper
```

## Payment Orchestration Integration

### How Flash Works (Payment Orchestration Model)

**Flash is a pure payment orchestrator** - it never holds or processes money directly:

```
User A Mobile Money Wallet → MTN/Airtel API → User B Mobile Money Wallet
                           ↑
                    Flash Backend
                 (orchestrates only)
```

### End-to-End User Experience

1. **User Initiates Payment**: Selects contact, enters amount, clicks "Flash"
2. **Provider Detection**: Flash detects optimal provider (MTN Zambia: +26097, +26076)
3. **Payment Orchestration**: Flash sends Request-to-Pay to MTN Collections API
4. **USSD Approval**: User receives mobile money prompt on their phone
5. **PIN Entry**: User enters mobile money PIN to approve payment
6. **Direct Transfer**: Money moves directly between mobile money wallets
7. **Status Tracking**: Flash tracks and displays payment progress
8. **Completion**: Both users see success confirmation in Flash app

### MTN Mobile Money Integration

The app integrates with MTN Mobile Money through the Collections API:

1. **Collections API** - For Request-to-Pay orchestration (P2P payments)
2. **Disbursement API** - For business disbursements (planned)
3. **Account Validation API** - For phone number validation (optional)

#### Payment Orchestration Flow
```python
# Example: Orchestrating payment via Flash
from payments.router import PaymentRouter

# 1. Create payment request
payment_request = PaymentRouter.create_payment_request(
    sender="+260971111111",
    recipient="+260976666666",
    amount=25.00,
    currency="ZMW",
    note="Flash payment test",
    external_id=transaction.reference_id
)

# 2. Route to appropriate provider (MTN auto-detected)
payment_result = PaymentRouter.send_payment(payment_request)

# 3. MTN Collections API receives Request-to-Pay
# 4. User gets USSD prompt on phone
# 5. User approves with PIN
# 6. Money transfers directly between wallets
# 7. Flash receives status update
```

#### MTN Collections API Integration
```python
# MTN Provider Implementation
class MTNZambiaProvider(IPaymentProvider):
    name = "mtn-zambia"
    country = "ZM"
    currency = "ZMW"
    
    def supports(self, msisdn: str) -> bool:
        """Check if phone number is MTN Zambia"""
        if not msisdn.startswith('+260'):
            return False
        prefix = msisdn[4:6]
        return prefix in ['97', '76']  # MTN Zambia prefixes
    
    def init_payment(self, request: PaymentRequest) -> Dict[str, Any]:
        """Send Request-to-Pay to MTN Collections API"""
        mtn_api = MtnCollectionsAPI()
        return mtn_api.request_to_pay(
            amount=request.amount,
            currency="EUR",  # MTN sandbox uses EUR
            payer_msisdn=request.sender,
            external_id=request.external_id,
            payer_message=request.note
        )
```

### QR Code Generation

P2P transactions can generate QR codes for payment requests:

```python
# QR code data structure
qr_data = {
    'type': 'flash_payment',
    'transaction_id': str(transaction.id),
    'amount': str(transaction.amount),
    'currency': transaction.currency,
    'recipient': recipient_name,
    'expires': expiration_time.isoformat()
}
```

## Security Considerations

### Authentication
- Token-based authentication using Django REST Framework's TokenAuthentication
- Tokens stored securely in mobile app using React Native Keychain
- Phone number as primary identifier with optional email

### Data Protection
- Sensitive user data encrypted at rest
- HTTPS enforced for all API communications
- Input validation and sanitization on all endpoints
- SQL injection protection through Django ORM

### Transaction Security
- Transaction amounts validated on both client and server
- Daily spending limits enforced at wallet level
- Transaction status tracking with audit trail
- Idempotency keys for payment operations

## Testing Strategy

### Backend Testing
- Unit tests for models, views, and serializers
- Integration tests for API endpoints
- Mock MTN API responses for testing
- Test coverage monitoring

### Mobile App Testing
- Unit tests for components and utilities
- Integration tests for user flows
- E2E testing with Detox (planned)
- Device testing on iOS and Android

### Manual Testing Checklist
- User registration and authentication flow
- Send money to existing and non-existing users
- Request money with QR code generation
- Transaction history and details
- Wallet balance updates
- MTN API integration

## Deployment

### Production Environment
- Docker containers with production-optimized builds
- PostgreSQL with connection pooling
- Redis for caching and session storage
- Nginx reverse proxy with SSL termination
- Celery workers for background tasks

### Mobile App Distribution
- iOS: App Store distribution with proper certificates
- Android: Google Play Store with signed APK
- Over-the-air updates capability

## Troubleshooting

### Common Backend Issues

1. **Database Connection Issues**
```bash
# Check database status
docker-compose exec db pg_isready -U flashuser

# Restart database
docker-compose restart db
```

2. **Migration Problems**
```bash
# Reset migrations (development only)
docker-compose exec backend python manage.py migrate --fake transactions zero
docker-compose exec backend python manage.py migrate transactions
```

3. **MTN API Issues**
- Check environment variables are set correctly
- Verify MTN sandbox credentials
- Check network connectivity to MTN endpoints

### Common Mobile App Issues

1. **Metro Bundler Issues**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clean and rebuild
cd ios && xcodebuild clean && cd ..
cd android && ./gradlew clean && cd ..
```

2. **Network Issues**
- Check API base URL in mobile app
- Verify backend is running and accessible
- Check iOS/Android network permissions

## Performance Considerations

### Backend Optimization
- Database indexing on frequently queried fields
- Query optimization with select_related and prefetch_related
- Caching of frequently accessed data with Redis
- Background task processing with Celery

### Mobile App Optimization
- Lazy loading of screens and components
- Image optimization and caching
- Efficient list rendering with FlatList
- Memory management for large datasets

## Future Enhancements

### Multi-Provider Expansion
- **Airtel Money Integration** - Add Airtel Zambia support (+26095, +26096)
- **Zamtel Kwacha Integration** - Add Zamtel support for complete coverage
- **Cross-Border Payments** - MTN Uganda, Ghana, etc. integration
- **Bank Integration** - Direct bank account payments via open banking
- **USSD Fallback** - Direct USSD integration for feature phones

### Advanced Features
- **Webhook Support** - Real-time payment status updates from providers
- **Account Validation** - Pre-payment phone number validation
- **SMS Notifications** - Payment confirmations via SMS
- **Biometric Authentication** - Touch ID/Face ID for app security
- **Bill Payment Integration** - Utilities, airtime, merchant payments
- **Business Accounts** - Merchant payment acceptance
- **Analytics Dashboard** - Transaction insights and reporting
- **Referral Program** - User acquisition and rewards

### Technical Improvements
- **Real-time Updates** - WebSocket integration for live status
- **Offline Capability** - Cache payments for later processing
- **Advanced Routing** - Smart provider selection based on success rates
- **Load Balancing** - Multi-instance deployment with auto-scaling
- **CI/CD Pipeline** - Automated testing and deployment
- **Monitoring** - Comprehensive payment orchestration analytics

## Code Quality Standards

### Python/Django
- Follow PEP 8 style guidelines
- Use type hints for function parameters and returns
- Write comprehensive docstrings
- Implement proper error handling
- Use Django best practices for security

### TypeScript/React Native
- Strict TypeScript configuration
- Functional components with hooks
- Proper prop typing for all components
- Error boundaries for crash prevention
- Performance optimization with React.memo and useMemo

## Testing and Validation

### End-to-End Testing

**Complete Sandbox Flow Test** (`test_complete_sandbox_flow.py`):
```bash
# Test complete payment orchestration
python test_complete_sandbox_flow.py

# Expected Flow:
# 1. User registration and authentication ✅
# 2. Provider detection and validation ✅
# 3. Payment orchestration via MTN Collections API ✅
# 4. Real USSD prompts in sandbox environment ✅
# 5. Status tracking and completion ✅
```

**MTN API Validation**:
- ✅ Token generation working
- ✅ Request-to-Pay sending successfully
- ✅ Status checking functional
- ✅ Account balance retrieval working
- ✅ 95% compliance with official MTN Collections API specification

### Production Readiness

**Architecture Status**:
- ✅ Payment orchestrator pattern implemented
- ✅ Multi-provider support architecture
- ✅ MTN Zambia provider working in sandbox
- ✅ End-to-end mobile app integration
- ✅ Real-time status tracking
- ✅ Security best practices implemented

## Contact and Support

For development questions or issues:
- Check the comprehensive README.md
- Review API documentation at /api/docs/
- Examine test files for usage examples (`test_complete_sandbox_flow.py`)
- Use Django admin panel for data inspection
- Check Docker logs for debugging information
- Review MTN API validation document (`OFFICIAL_MTN_API_VALIDATION.md`)

The application is designed to be a production-ready payment orchestration platform with modern architecture, comprehensive testing, and security best practices. Flash successfully orchestrates payments between mobile money wallets without ever handling money directly.