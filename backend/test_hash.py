import hashlib

password = "Admin123!"
hashed = hashlib.sha256(password.encode()).hexdigest()
print(f"Password: {password}")
print(f"Hashed (SHA256): {hashed}")
print(f"Length: {len(hashed)} characters")