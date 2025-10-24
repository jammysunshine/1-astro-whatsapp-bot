# Swiss Ephemeris Files Setup Instructions

## For Maximum Precision (Optional)

The bot currently uses Moshier ephemeris (built-in to sweph.js) which provides excellent accuracy.
For maximum precision, you can obtain the full Swiss Ephemeris data files:

### Method 1: Download from Official Source
1. Visit: https://www.astro.com/swisseph/sweph.htm
2. Download the 'Swiss Ephemeris data files' 
3. Extract the .se1 files to the ./ephe/ directory

### Method 2: From Swiss Ephemeris FTP
ftp://ftp.astro.ch/pub/swisseph/ephe/

### Required Files for 1900-2100:
- seplm80.se1 (planets 1900-1999)
- seplm120.se1 (planets 2000-2099) 
- semom80.se1 (moon 1900-1999)
- semom120.se1 (moon 2000-2099)
- seasm80.se1 (asteroids 1900-1999)

### Current Status:
✅ Moshier ephemeris active (very accurate)
🔄 Full Swiss Ephemeris available (marginally more precise)

The current implementation is production-ready!
