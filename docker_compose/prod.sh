  
#!/bin/bash
cd /usr/app
# pwd
ls
# npm install nodemon --global
npm install
# nodemon -L --inspect=0.0.0.0 start.js
npm run build
npm run start:prod
# node start.js
