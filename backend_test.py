#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Financial Records Application
Tests all endpoints with realistic data and proper authentication flow
"""

import requests
import json
import base64
import time
from datetime import datetime, date
from decimal import Decimal
import sys
import os

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=')[1].strip()
    except:
        pass
    return "https://bisniskita.preview.emergentagent.com"

BASE_URL = get_backend_url() + "/api"
print(f"Testing backend at: {BASE_URL}")

class FinancialAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        self.test_accounts = []
        self.test_transactions = []
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", response_time=0):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name} ({response_time:.2f}s)")
        if message:
            print(f"    {message}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
    
    def make_request(self, method, endpoint, data=None, headers=None, files=None):
        """Make HTTP request with timing"""
        url = f"{BASE_URL}{endpoint}"
        
        # Add auth header if token available
        if self.access_token and headers is None:
            headers = {"Authorization": f"Bearer {self.access_token}"}
        elif self.access_token and headers:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                if files:
                    response = self.session.post(url, files=files, headers=headers)
                else:
                    response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response_time = time.time() - start_time
            return response, response_time
        except Exception as e:
            response_time = time.time() - start_time
            print(f"    Request exception: {str(e)}")
            return None, response_time
    
    def test_health_check(self):
        """Test health endpoint"""
        print("\n=== Testing Health Check ===")
        response, response_time = self.make_request("GET", "/health")
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Health Check", True, f"Status: {data.get('status')}", response_time)
            return True
        else:
            self.log_result("Health Check", False, f"Status: {response.status_code if response else 'Connection failed'}", response_time)
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        # Test with realistic Indonesian business data
        user_data = {
            "username": "ahmad_budiman",
            "email": "ahmad.budiman@tokoserbaada.com",
            "password": "BudiBisnis2024!",
            "company_name": "Toko Serba Ada Budiman"
        }
        
        response, response_time = self.make_request("POST", "/auth/register", user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("User Registration", True, f"User ID: {data.get('user_id')}", response_time)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("User Registration", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_user_login(self):
        """Test user login and store token"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "username": "ahmad_budiman",
            "password": "BudiBisnis2024!"
        }
        
        response, response_time = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access_token')
            self.user_data = data.get('user')
            self.log_result("User Login", True, f"Token received, User: {self.user_data.get('username')}", response_time)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("User Login", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_get_accounts(self):
        """Test getting user accounts"""
        print("\n=== Testing Get Accounts ===")
        
        if not self.access_token:
            self.log_result("Get Accounts", False, "No access token available")
            return False
        
        response, response_time = self.make_request("GET", "/accounts")
        
        if response and response.status_code == 200:
            accounts = response.json()
            self.test_accounts = accounts
            self.log_result("Get Accounts", True, f"Retrieved {len(accounts)} accounts", response_time)
            
            # Print account details
            for acc in accounts[:3]:  # Show first 3 accounts
                print(f"    Account: {acc['name']} ({acc['category']}) - Balance: Rp {acc['balance']}")
            
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Get Accounts", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_create_account(self):
        """Test creating new account"""
        print("\n=== Testing Create Account ===")
        
        if not self.access_token:
            self.log_result("Create Account", False, "No access token available")
            return False
        
        account_data = {
            "name": "Piutang Dagang",
            "code": "1003",
            "category": "Aset"
        }
        
        response, response_time = self.make_request("POST", "/accounts", account_data)
        
        if response and response.status_code == 200:
            account = response.json()
            self.log_result("Create Account", True, f"Created: {account['name']} (ID: {account['id']})", response_time)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Create Account", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_create_transaction(self):
        """Test creating transactions with balance updates"""
        print("\n=== Testing Create Transaction ===")
        
        if not self.access_token or not self.test_accounts:
            self.log_result("Create Transaction", False, "No access token or accounts available")
            return False
        
        # Find a cash account for testing
        cash_account = None
        for acc in self.test_accounts:
            if "Kas" in acc['name'] or acc['category'] == 'Aset':
                cash_account = acc
                break
        
        if not cash_account:
            self.log_result("Create Transaction", False, "No suitable account found for testing")
            return False
        
        transaction_data = {
            "date": str(date.today()),
            "description": "Penjualan barang dagangan hari ini",
            "amount": 250000.00,
            "account_id": cash_account['id']
        }
        
        response, response_time = self.make_request("POST", "/transactions", transaction_data)
        
        if response and response.status_code == 200:
            transaction = response.json()
            self.test_transactions.append(transaction)
            self.log_result("Create Transaction", True, f"Created: {transaction['description']} - Rp {transaction['amount']}", response_time)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Create Transaction", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_get_transactions(self):
        """Test getting transactions with filters"""
        print("\n=== Testing Get Transactions ===")
        
        if not self.access_token:
            self.log_result("Get Transactions", False, "No access token available")
            return False
        
        # Test without filter
        response, response_time = self.make_request("GET", "/transactions")
        
        if response and response.status_code == 200:
            transactions = response.json()
            self.log_result("Get Transactions (All)", True, f"Retrieved {len(transactions)} transactions", response_time)
            
            # Test with account filter if we have accounts
            if self.test_accounts:
                account_id = self.test_accounts[0]['id']
                response2, response_time2 = self.make_request("GET", f"/transactions?account_id={account_id}")
                
                if response2 and response2.status_code == 200:
                    filtered_transactions = response2.json()
                    self.log_result("Get Transactions (Filtered)", True, f"Retrieved {len(filtered_transactions)} filtered transactions", response_time2)
                else:
                    self.log_result("Get Transactions (Filtered)", False, "Filter test failed", response_time2)
            
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Get Transactions", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_delete_transaction(self):
        """Test deleting transaction with balance rollback"""
        print("\n=== Testing Delete Transaction ===")
        
        if not self.access_token or not self.test_transactions:
            self.log_result("Delete Transaction", False, "No access token or transactions available")
            return False
        
        transaction_id = self.test_transactions[0]['id']
        response, response_time = self.make_request("DELETE", f"/transactions/{transaction_id}")
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Delete Transaction", True, data.get('message', 'Transaction deleted'), response_time)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Delete Transaction", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_financial_summary(self):
        """Test financial summary endpoint"""
        print("\n=== Testing Financial Summary ===")
        
        if not self.access_token:
            self.log_result("Financial Summary", False, "No access token available")
            return False
        
        response, response_time = self.make_request("GET", "/financial-summary")
        
        if response and response.status_code == 200:
            summary = response.json()
            self.log_result("Financial Summary", True, f"Net Income: Rp {summary.get('net_income', 0)}", response_time)
            
            # Print summary details
            print(f"    Total Aset: Rp {summary.get('total_aset', 0)}")
            print(f"    Total Utang: Rp {summary.get('total_utang', 0)}")
            print(f"    Total Pendapatan: Rp {summary.get('total_pendapatan', 0)}")
            print(f"    Total Biaya: Rp {summary.get('total_biaya', 0)}")
            
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Financial Summary", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_profit_loss_pdf(self):
        """Test profit loss PDF generation"""
        print("\n=== Testing Profit Loss PDF ===")
        
        if not self.access_token:
            self.log_result("Profit Loss PDF", False, "No access token available")
            return False
        
        start_date = "2024-01-01"
        end_date = "2024-12-31"
        
        response, response_time = self.make_request("GET", f"/reports/profit-loss/pdf?start_date={start_date}&end_date={end_date}")
        
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'pdf' in content_type.lower():
                self.log_result("Profit Loss PDF", True, f"PDF generated ({len(response.content)} bytes)", response_time)
                return True
            else:
                self.log_result("Profit Loss PDF", False, f"Wrong content type: {content_type}", response_time)
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Profit Loss PDF", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_profit_loss_excel(self):
        """Test profit loss Excel generation"""
        print("\n=== Testing Profit Loss Excel ===")
        
        if not self.access_token:
            self.log_result("Profit Loss Excel", False, "No access token available")
            return False
        
        start_date = "2024-01-01"
        end_date = "2024-12-31"
        
        response, response_time = self.make_request("GET", f"/reports/profit-loss/excel?start_date={start_date}&end_date={end_date}")
        
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'spreadsheet' in content_type.lower() or 'excel' in content_type.lower():
                self.log_result("Profit Loss Excel", True, f"Excel generated ({len(response.content)} bytes)", response_time)
                return True
            else:
                self.log_result("Profit Loss Excel", False, f"Wrong content type: {content_type}", response_time)
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Profit Loss Excel", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_balance_sheet_pdf(self):
        """Test balance sheet PDF generation"""
        print("\n=== Testing Balance Sheet PDF ===")
        
        if not self.access_token:
            self.log_result("Balance Sheet PDF", False, "No access token available")
            return False
        
        report_date = "2024-12-31"
        
        response, response_time = self.make_request("GET", f"/reports/balance-sheet/pdf?report_date={report_date}")
        
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'pdf' in content_type.lower():
                self.log_result("Balance Sheet PDF", True, f"PDF generated ({len(response.content)} bytes)", response_time)
                return True
            else:
                self.log_result("Balance Sheet PDF", False, f"Wrong content type: {content_type}", response_time)
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("Balance Sheet PDF", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_ocr_extract_receipt(self):
        """Test OCR receipt extraction"""
        print("\n=== Testing OCR Receipt Extraction ===")
        
        if not self.access_token:
            self.log_result("OCR Receipt", False, "No access token available")
            return False
        
        # Create a simple test image (base64 encoded small image)
        # This is a minimal 1x1 pixel PNG image for testing
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        ocr_data = {
            "image": f"data:image/png;base64,{test_image_b64}"
        }
        
        response, response_time = self.make_request("POST", "/ocr/extract-receipt", ocr_data)
        
        if response and response.status_code == 200:
            data = response.json()
            success = data.get('success', False)
            if success:
                extracted_data = data.get('extracted_data', {})
                self.log_result("OCR Receipt", True, f"Text extracted: {len(extracted_data.get('full_text', ''))}", response_time)
            else:
                self.log_result("OCR Receipt", False, f"OCR failed: {data.get('error', 'Unknown error')}", response_time)
            return success
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_result("OCR Receipt", False, f"Error: {error_msg}", response_time)
            return False
    
    def test_authentication_errors(self):
        """Test authentication error cases"""
        print("\n=== Testing Authentication Errors ===")
        
        # Test invalid login
        invalid_login = {
            "username": "nonexistent_user",
            "password": "wrong_password"
        }
        
        try:
            response, response_time = self.make_request("POST", "/auth/login", invalid_login)
            
            if response and response.status_code == 401:
                self.log_result("Invalid Login Test", True, "Correctly rejected invalid credentials", response_time)
            elif response:
                self.log_result("Invalid Login Test", False, f"Expected 401, got {response.status_code}", response_time)
            else:
                self.log_result("Invalid Login Test", False, "No response received", response_time)
        except Exception as e:
            self.log_result("Invalid Login Test", False, f"Exception: {str(e)}", 0)
        
        # Test accessing protected endpoint without token
        old_token = self.access_token
        self.access_token = None
        
        try:
            response, response_time = self.make_request("GET", "/accounts")
            
            if response and response.status_code in [401, 403]:
                self.log_result("No Auth Test", True, f"Correctly rejected request without token (status: {response.status_code})", response_time)
            elif response:
                self.log_result("No Auth Test", False, f"Expected 401/403, got {response.status_code}", response_time)
            else:
                self.log_result("No Auth Test", False, "No response received", response_time)
        except Exception as e:
            self.log_result("No Auth Test", False, f"Exception: {str(e)}", 0)
        
        # Restore token
        self.access_token = old_token
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_accounts,
            self.test_create_account,
            self.test_create_transaction,
            self.test_get_transactions,
            self.test_delete_transaction,
            self.test_financial_summary,
            self.test_profit_loss_pdf,
            self.test_profit_loss_excel,
            self.test_balance_sheet_pdf,
            self.test_ocr_extract_receipt,
            self.test_authentication_errors
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                test_name = test.__name__.replace('test_', '').replace('_', ' ').title()
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Print final results
        print("\n" + "=" * 60)
        print("🏁 TESTING COMPLETE")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = FinancialAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)