import os
import re

def check_links():
    base_dir = r'c:\Users\Gard Eau Arbres\Documents\el_ramon_music_club'
    
    html_files = []
    for root, dirs, files in os.walk(base_dir):
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    href_pattern = re.compile(r'href=["\']([^"\']+)["\']')
    src_pattern = re.compile(r'src=["\']([^"\']+)["\']')
    
    broken_links = []
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        links = href_pattern.findall(content) + src_pattern.findall(content)
        file_dir = os.path.dirname(html_file)
        
        for link in links:
            if link.startswith('http://') or link.startswith('https://'):
                continue
            if link.startswith('mailto:') or link.startswith('tel:') or link.startswith('#'):
                continue
                
            clean_link = link.split('?')[0].split('#')[0]
            if not clean_link:
                continue
                
            if clean_link.startswith('/'):
                target_path = os.path.join(base_dir, clean_link.lstrip('/'))
            else:
                target_path = os.path.join(file_dir, clean_link)
                
            target_path = os.path.normpath(target_path)
            
            if not os.path.exists(target_path):
                broken_links.append((html_file, link))

    with open('broken_links_report.txt', 'w', encoding='utf-8') as f:
        if not broken_links:
            f.write("No broken local links found!\n")
        else:
            f.write(f"Found {len(broken_links)} broken local links:\n")
            for html_file, link in broken_links:
                f.write(f"  In {os.path.relpath(html_file, base_dir)}: {link}\n")
    print("Report written to broken_links_report.txt")

if __name__ == '__main__':
    check_links()
