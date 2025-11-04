# Flash Payment App - Sandbox Test Users

## MTN Mobile Money Sandbox Test Users

### Official MTN Test Numbers (International Format):
- **Primary**: `+46733123450` (Sweden - MTN's official sandbox)
- **Secondary**: `+46733123451`
- **Alternative**: `+46733123452`

### Zambian Test Numbers (Flash App Format):
For testing in Zambia context, use these numbers:

#### Test User 1:
- **Phone**: `+260971111111`
- **Password**: `test123`
- **Name**: `John Mwanza`
- **Status**: Pre-registered for testing

#### Test User 2:
- **Phone**: `+260977777777`
- **Password**: `test123`
- **Name**: `Sarah Banda`
- **Status**: Pre-registered for testing

#### Test User 3:
- **Phone**: `+260976666666`
- **Password**: `test123`
- **Name**: `Mary Lungu`
- **Status**: Pre-registered for testing

## How to Test:

### 1. Register New Test User:
```bash
curl -X POST http://localhost:8002/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+260971111111",
    "password": "test123",
    "password_confirm": "test123",
    "full_name": "John Mwanza"
  }'
```

### 2. Login with Test User:
```bash
curl -X POST http://localhost:8002/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+260971111111",
    "password": "test123"
  }'
```

### 3. Mobile App Login:
1. Open Flash app
2. Click "Already have an account?"
3. Enter: `+260971111111`
4. Enter password: `test123`
5. Login successfully!

## Sandbox Behavior:

- ✅ All payments return `SUCCESSFUL` status
- ✅ No real money is transferred
- ✅ MTN USSD prompts are simulated
- ✅ Transaction history is recorded
- ✅ All API endpoints work normally

## Payment Test Flow:

1. **Login** with test user
2. **Send Money** to another test number
3. **Check Activity** to see transaction
4. **View Receipt** for confirmation

## Important Notes:

- Use **EUR currency** for MTN sandbox (auto-converted to ZMW in app)
- All transactions are **simulated** - no real money moves
- Test numbers work for both **sender** and **recipient**
- Backend logs show real MTN API integration status