#!/usr/bin/env python3
"""
Generate SQL seed file for all groups and ULIs from AccessCodeModal.jsx
"""

import re

# Group codes
group_codes = {
    1: 'SIw}M5d7',
    2: '<3&37Lv&',
    3: 'q%0J]0f]',
    4: 's>2YWc!a',
    5: 'Nw!+P8*I',
    6: 'o>rH2,ay',
    7: '98A$s*Tc',
    8: 'Hl27i!&A',
    9: 'GefZE8/V',
    10: 't}?c8M?X',
    11: '5m},O.Dd',
    12: 'R.7bM!CT',
    13: 'T&6IPf8b',
    14: '8usY/-gT',
    15: 'W)4<yLT#',
    16: '7+wB%6Q71',
    17: 'U1>R$u2G',
    18: 'rR1((^DH',
    19: '88b>FW16',
    20: '#Unh9@SI'
}

# Read ULIs from AccessCodeModal.jsx
with open('src/components/AccessCodeModal.jsx', 'r') as f:
    content = f.read()

# Extract groupULIs object
pattern = r'const groupULIs = \{([\s\S]*?)\}'
match = re.search(pattern, content)
if not match:
    print("Error: Could not find groupULIs in AccessCodeModal.jsx")
    exit(1)

group_ulis_text = match.group(1)

# Parse each group's ULIs - handle multiline arrays
group_ulis = {}
for i in range(1, 21):
    # Find group i's array - match across multiple lines
    pattern = rf'{i}:\s*\[([^\]]+)\]'
    match = re.search(pattern, group_ulis_text, re.DOTALL)
    if match:
        ulis_str = match.group(1)
        # Extract quoted strings (handle both single and double quotes)
        ulis = re.findall(r"['\"]([^'\"]+)['\"]", ulis_str)
        if ulis:
            group_ulis[i] = ulis
        else:
            print(f"Warning: No ULIs found for group {i}")
    else:
        print(f"Warning: Could not find ULIs for group {i}")

# Generate SQL
sql_lines = [
    "-- Seed script for Groups and ULIs",
    "-- Generated automatically from AccessCodeModal.jsx",
    "",
    "-- Insert groups 1-20 with their codes",
    "INSERT INTO groups (group_number, group_code) VALUES"
]

# Groups
group_values = []
for i in range(1, 21):
    code = group_codes[i]
    group_values.append(f"({i}, '{code}')")

sql_lines.append(",\n".join(group_values) + "\nON CONFLICT (group_number) DO NOTHING;")
sql_lines.append("")
sql_lines.append("-- Insert ULIs for all groups")

# ULIs
for group_num in range(1, 21):
    if group_num in group_ulis:
        ulis = group_ulis[group_num]
        sql_lines.append(f"\n-- Group {group_num} ULIs")
        sql_lines.append("INSERT INTO ulis (uli_value, group_number) VALUES")
        
        uli_values = []
        for uli in ulis:
            # Escape single quotes in ULI
            uli_escaped = uli.replace("'", "''")
            uli_values.append(f"('{uli_escaped}', {group_num})")
        
        sql_lines.append(",\n".join(uli_values) + "\nON CONFLICT (uli_value) DO NOTHING;")

# Write to file
with open('database/seed_groups_and_ulis.sql', 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated seed file with {len(group_ulis)} groups and {sum(len(ulis) for ulis in group_ulis.values())} ULIs")

