import sys

file_path = r'f:\TJP\mushroom-website\src\pages\Dashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

depth = 0
in_backticks = False

for i, line in enumerate(lines):
    # Very simple backtick toggle
    backtick_count = line.count('`')
    if backtick_count % 2 != 0:
        in_backticks = not in_backticks
    
    if not in_backticks:
        depth += line.count('{')
        depth -= line.count('}')
    
    if depth < 0:
        print(f"Error: Depth became negative at line {i+1}: {line.strip()}")
        depth = 0

print(f"Final Depth: {depth}")
if depth > 0:
    print("Warning: File ended with positive depth. Something is not closed.")
elif depth == 0:
    print("Brace balance seems correct (ignoring complex cases).")
