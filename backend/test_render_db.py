# backend/test_render_db.py - Test Render database connection
import os
from dotenv import load_dotenv

load_dotenv()

# Try to get the database URL
db_url = os.getenv("DATABASE_URL", "")

print("Testing Render Database Connection")
print("=" * 50)

if not db_url:
    print("ERROR: No DATABASE_URL found in .env file")
    print("\nPlease add this to your .env file:")
    print('DATABASE_URL="postgresql://username:password@dpg-d61cj314tr6s73c8s74g-a.oregon-postgres.render.com:5432/database_name"')
    print("\nGet the full URL from Render dashboard > PostgreSQL service > Connection")
elif "postgresql://" in db_url:
    print(f"Found PostgreSQL URL: {db_url[:60]}...")
    
    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()[0]
        conn.close()
        
        print(f"SUCCESS: Connected to PostgreSQL!")
        print(f"Database: {db_name}")
        print(f"Version: {version}")
        print(f"\nYour connection is working! Use this URL:")
        print(f"DATABASE_URL={db_url}")
        
    except Exception as e:
        print(f"ERROR: Connection failed - {str(e)}")
        print("\nCommon issues:")
        print("1. Wrong password")
        print("2. Network blocked (try different port)")
        print("3. Database doesn't exist")
        print("\nCheck your Render dashboard for the correct URL")
else:
    print(f"Using: {db_url}")
    print("This doesn't look like a Render PostgreSQL URL")
