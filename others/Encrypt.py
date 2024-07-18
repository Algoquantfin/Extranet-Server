import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

LOGIN_ID = "RMS"
PASSWORD = "Key"
SECRET_KEY = "Key"

# Convert password to bytes
password_bytes = PASSWORD.encode('utf-8')

# Decode the secret key from base64
key = base64.b64decode(SECRET_KEY)

# Initialize AES cipher in ECB mode
cipher = AES.new(key, AES.MODE_ECB)

# Pad the password to fit the AES block size (16 bytes)
padded_password = pad(password_bytes, AES.block_size)

# Encrypt the padded password
encrypted_password = cipher.encrypt(padded_password)

# Encode the encrypted password in base64
encrypted_password_b64 = base64.b64encode(encrypted_password).decode('utf-8')

print("Encrypted Password:", encrypted_password_b64)
