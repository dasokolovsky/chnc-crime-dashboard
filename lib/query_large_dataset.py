#!/usr/bin/env python3
"""
Robust LA City Crime Data Querier
Handles datasets larger than 1000 records using proper pagination
"""

import requests
import json
import csv
import sys
from datetime import datetime
import time

class LACrimeDatQuerier:
    def __init__(self, app_token=None):
        self.base_url = "https://data.lacity.org/resource/y8y3-fqfu.json"
        self.app_token = app_token
        self.session = requests.Session()
        if app_token:
            self.session.headers.update({'X-App-Token': app_token})
    
    def build_where_clause(self, districts, start_date, end_date):
        """Build the WHERE clause for the query"""
        district_list = "', '".join(districts)
        where_clause = f"rpt_dist_no IN ('{district_list}') AND date_occ >= '{start_date}' AND date_occ <= '{end_date}'"
        return where_clause
    
    def get_total_count(self, where_clause):
        """Get the total count of records matching the criteria"""
        params = {
            '$select': 'count(*)',
            '$where': where_clause
        }
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return int(data[0]['count'])
        except Exception as e:
            print(f"Error getting count: {e}")
            return 0
    
    def query_with_pagination(self, districts, start_date, end_date, limit_per_page=1000):
        """Query data with proper pagination to handle large datasets"""
        where_clause = self.build_where_clause(districts, start_date, end_date)
        
        # First, get the total count
        total_count = self.get_total_count(where_clause)
        print(f"Total records found: {total_count}")
        
        if total_count == 0:
            return []
        
        all_records = []
        offset = 0
        page = 1
        
        while offset < total_count:
            print(f"Fetching page {page} (records {offset + 1}-{min(offset + limit_per_page, total_count)})...")
            
            params = {
                '$where': where_clause,
                '$order': 'date_occ DESC',
                '$limit': limit_per_page,
                '$offset': offset
            }
            
            try:
                response = self.session.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                page_data = response.json()
                
                if not page_data:
                    print("No more data returned, stopping pagination")
                    break
                
                all_records.extend(page_data)
                print(f"Retrieved {len(page_data)} records from page {page}")
                
                offset += limit_per_page
                page += 1
                
                # Be nice to the API - small delay between requests
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error fetching page {page}: {e}")
                break
        
        print(f"Total records retrieved: {len(all_records)}")
        return all_records
    
    def query_with_high_limit(self, districts, start_date, end_date, limit=50000):
        """Query data using high limit (up to 50,000 for SODA 2.0)"""
        where_clause = self.build_where_clause(districts, start_date, end_date)
        
        params = {
            '$where': where_clause,
            '$order': 'date_occ DESC',
            '$limit': limit
        }
        
        try:
            print(f"Querying with limit={limit}...")
            response = self.session.get(self.base_url, params=params, timeout=60)
            response.raise_for_status()
            data = response.json()
            print(f"Retrieved {len(data)} records")
            return data
        except Exception as e:
            print(f"Error with high limit query: {e}")
            return []
    
    def save_to_csv(self, data, filename):
        """Save data to CSV file"""
        if not data:
            print("No data to save")
            return False
        
        # Get all unique keys from all records
        all_keys = set()
        for record in data:
            all_keys.update(record.keys())
        
        # Sort keys for consistent column order
        fieldnames = sorted(list(all_keys))
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for record in data:
                    writer.writerow(record)
            
            print(f"Successfully saved {len(data)} records to {filename}")
            print(f"Columns: {', '.join(fieldnames)}")
            return True
        except Exception as e:
            print(f"Error saving to CSV: {e}")
            return False

def main():
    # Configuration
    APP_TOKEN = None  # Set to None to avoid 403 errors, use token when needed for rate limits
    DISTRICTS = ["645", "646", "647", "666", "663", "656", "676"]
    START_DATE = "2025-07-26"
    END_DATE = "2025-08-25"
    OUTPUT_FILE = "hollywood_crimes_30days_robust.csv"

    # Initialize querier
    querier = LACrimeDatQuerier(app_token=APP_TOKEN)
    
    print("LA City Crime Data Querier")
    print("=" * 50)
    print(f"Districts: {', '.join(DISTRICTS)}")
    print(f"Date range: {START_DATE} to {END_DATE}")
    print()
    
    # Method 1: Try high limit first (faster if dataset < 50k)
    print("Method 1: Trying high limit query...")
    data = querier.query_with_high_limit(DISTRICTS, START_DATE, END_DATE)
    
    # Method 2: If high limit fails or returns exactly 50k, use pagination
    if not data or len(data) == 50000:
        print("\nMethod 2: Using pagination for robust data retrieval...")
        data = querier.query_with_pagination(DISTRICTS, START_DATE, END_DATE)
    
    # Save to CSV
    if data:
        querier.save_to_csv(data, OUTPUT_FILE)
        print(f"\nData successfully exported to {OUTPUT_FILE}")
    else:
        print("No data retrieved")

if __name__ == "__main__":
    main()
