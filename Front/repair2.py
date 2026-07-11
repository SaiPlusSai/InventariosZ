import glob

for path in glob.glob('src/pages/*/index.jsx'):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    garbage = """</>
          )}
        </div>
      </div>"""
      
    if garbage in content:
        content = content.replace(garbage, "")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed garbage in {path}")
