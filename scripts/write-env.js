const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const authApiUrl = process.env.AUTH_API_URL || 'http://localhost:3001';
const membersApiUrl = process.env.MEMBERS_API_URL || 'http://localhost:3002';
const classesApiUrl = process.env.CLASSES_API_URL || 'http://localhost:3003';

const content = `export const environment = {
  production: true,
  authApiUrl: '${authApiUrl}',
  membersApiUrl: '${membersApiUrl}',
  classesApiUrl: '${classesApiUrl}'
};
`;

fs.writeFileSync(outputPath, content);
console.log(`Wrote production environment to ${outputPath}`);
