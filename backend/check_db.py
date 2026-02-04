import sqlite3

conn = sqlite3.connect('agentic_ai.db')
cursor = conn.cursor()

# List tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Check users table structure
cursor.execute("PRAGMA table_info(users);")
columns = cursor.fetchall()
print("\nUsers table columns:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

# Check if admin user exists
cursor.execute("SELECT * FROM users;")
users = cursor.fetchall()
print(f"\nFound {len(users)} users:")
for user in users:
    print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[3]}")

conn.close()