import os

def fix_file(filepath):
    print(f"Checking {filepath}...")
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()
    
    try:
        text = raw_bytes.decode('utf-8')
        if 'à¦' in text or 'Ã' in text:
            print("Mojibake detected! Attempting cp1252 decode...")
            try:
                # Recover original utf-8 bytes by encoding as cp1252
                fixed_text = text.encode('cp1252').decode('utf-8')
                
                # Backup
                with open(filepath + '.bak', 'wb') as f:
                    f.write(raw_bytes)
                
                # Save fixed
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                
                print(f"Fixed {filepath}")
            except Exception as e:
                print(f"Failed to fix: {e}")
        else:
            print("File looks fine (no obvious mojibake).")
    except Exception as e:
        print(f"Failed to read as utf-8: {e}")

fix_file('src/components/Navbar.jsx')
fix_file('src/locales/bn/translation.json')
