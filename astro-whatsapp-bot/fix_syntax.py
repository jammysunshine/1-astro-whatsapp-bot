#!/usr/bin/env python3

with open('astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js', 'r') as f:
    lines = f.readlines()

# Fix duplicate const declarations by changing them to assignments
for i in range(len(lines)):
    if 'const userLanguage =' in lines[i] and '    ' in lines[i][:4]:
        lines[i] = lines[i].replace('const userLanguage =', 'userLanguage =')
    if 'const mainMenu =' in lines[i] and '    ' in lines[i][:4]:
        lines[i] = lines[i].replace('const mainMenu =', 'mainMenu =')

with open('astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js', 'w') as f:
    f.writelines(lines)

print("Fixed duplicate const declarations")