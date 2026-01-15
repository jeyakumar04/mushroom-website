import sys

file_path = r'f:\TJP\mushroom-website\src\pages\Dashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

open_braces = content.count('{')
close_braces = content.count('}')

print(f"Open: {open_braces}")
print(f"Close: {close_braces}")
print(f"Difference: {open_braces - close_braces}")
