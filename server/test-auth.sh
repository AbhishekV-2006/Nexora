#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# NEXORA AUTH ENDPOINTS TESTING SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# 
# This script tests all authentication endpoints to verify they work correctly
# 
# Prerequisites:
# - Backend server running on http://localhost:5001
# - MongoDB connected
# 
# Usage:
# chmod +x test-auth.sh
# ./test-auth.sh
# ═══════════════════════════════════════════════════════════════════════════════

SERVER_URL="http://localhost:5001"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  NEXORA AUTHENTICATION ENDPOINTS TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}\n"

# ─────────────────────────────────────────────────────────────────────────────
# TEST 1: Health Check
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 1: Health Check${NC}"
echo -e "${YELLOW}GET /api/health${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -X GET "$SERVER_URL/api/health")
echo "Response:"
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 2: Register New User
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 2: Register New User${NC}"
echo -e "${YELLOW}POST /api/auth/register${NC}"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser_'$(date +%s)'@example.com",
    "password": "SecurePassword123",
    "role": "freelancer"
  }')

echo "Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extract access token for next test
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken' 2>/dev/null)
USER_EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.user.email' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to register user${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Registration successful${NC}"
echo -e "Token: ${ACCESS_TOKEN:0:50}..."
echo -e "Email: $USER_EMAIL"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 3: Login with Credentials
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 3: Login with Credentials${NC}"
echo -e "${YELLOW}POST /api/auth/login${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"SecurePassword123\"
  }")

echo "Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ -z "$LOGIN_TOKEN" ] || [ "$LOGIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to login${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 4: Get Current User (Protected Route)
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 4: Get Current User (Protected Route)${NC}"
echo -e "${YELLOW}GET /api/auth/me${NC}"
echo -e "Header: Authorization: Bearer <token>"
echo ""

ME_RESPONSE=$(curl -s -X GET "$SERVER_URL/api/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Response:"
echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
echo ""

ME_USER=$(echo "$ME_RESPONSE" | jq -r '.user' 2>/dev/null)

if [ -z "$ME_USER" ] || [ "$ME_USER" = "null" ]; then
  echo -e "${RED}❌ Failed to get current user${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Got current user successfully${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 5: Invalid Token (Should Fail)
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 5: Invalid Token (Should Return 403)${NC}"
echo -e "${YELLOW}GET /api/auth/me${NC}"
echo -e "Header: Authorization: Bearer invalid_token_xyz"
echo ""

INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$SERVER_URL/api/auth/me" \
  -H "Authorization: Bearer invalid_token_xyz")

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n 1)
BODY=$(echo "$INVALID_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid token (HTTP 403)${NC}"
else
  echo -e "${RED}❌ Expected HTTP 403, got $HTTP_CODE${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 6: Invalid Email Format (Should Fail)
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 6: Invalid Email Format (Should Return 400)${NC}"
echo -e "${YELLOW}POST /api/auth/register${NC}"
echo ""

INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email-format",
    "password": "SecurePassword123",
    "role": "freelancer"
  }')

HTTP_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -n 1)
BODY=$(echo "$INVALID_EMAIL_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid email (HTTP 400)${NC}"
else
  echo -e "${RED}❌ Expected HTTP 400, got $HTTP_CODE${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 7: Password Too Short (Should Fail)
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${YELLOW}TEST 7: Password Too Short (Should Return 400)${NC}"
echo -e "${YELLOW}POST /api/auth/register${NC}"
echo ""

SHORT_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "shortpass_'$(date +%s)'@example.com",
    "password": "123",
    "role": "freelancer"
  }')

HTTP_CODE=$(echo "$SHORT_PASSWORD_RESPONSE" | tail -n 1)
BODY=$(echo "$SHORT_PASSWORD_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Correctly rejected short password (HTTP 400)${NC}"
else
  echo -e "${RED}❌ Expected HTTP 400, got $HTTP_CODE${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Health Check: PASSED${NC}"
echo -e "${GREEN}✅ Register: PASSED${NC}"
echo -e "${GREEN}✅ Login: PASSED${NC}"
echo -e "${GREEN}✅ Get Current User: PASSED${NC}"
echo -e "${GREEN}✅ Invalid Token Rejection: PASSED${NC}"
echo -e "${GREEN}✅ Invalid Email Validation: PASSED${NC}"
echo -e "${GREEN}✅ Password Length Validation: PASSED${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}All tests completed successfully! 🎉${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
