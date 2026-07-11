import glob

for path in glob.glob('src/pages/*/index.jsx'):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We are looking for:
    #               </Button>
    #             
    # 
    # 
    #       <Card className="mb-6">
    
    # To replace with:
    #               </Button>
    #             </>
    #           )}
    #         </div>
    #       </div>
    #       <Card className="mb-6">
    
    import re
    # Using regex to match the gap between Button and Card
    pattern = r'(</Button>\s*)\n\n\n\s*<Card className="mb-6">'
    replacement = r'\1</>\n          )}\n        </div>\n      </div>\n      <Card className="mb-6">'
    
    new_content, count = re.subn(pattern, replacement, content)
    if count > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed missing closure in {path}")
