const fs = require('fs');

try {
  let layoutPath = 'src/components/Layout.tsx';
  let code = fs.readFileSync(layoutPath, 'utf8');

  // Regex string match for multi-line
  const target = 'if (user?.role === "teacher") {\\n    navItems.push({\\n      name: "Performance",';
  const targetWin = 'if (user?.role === "teacher") {\\r\\n    navItems.push({\\r\\n      name: "Performance",';

  const replace = `if (user?.role === "teacher") {
    navItems.push({
      name: "Students",
      href: "/students",
      icon: UsersIcon,
      current: location.pathname.startsWith("/students"),
    });
    navItems.push({
      name: "Performance",`;

  if (code.includes('if (user?.role === "teacher") {\\r\\n    navItems.push({\\r\\n      name: "Performance",'.replace(/\\\\r\\\\n/g, '\\r\\n'))) {
    code = code.replace('if (user?.role === "teacher") {\\r\\n    navItems.push({\\r\\n      name: "Performance",'.replace(/\\\\r\\\\n/g, '\\r\\n'), replace.replace(/\\n/g, '\\r\\n'));
  } else if (code.includes('if (user?.role === "teacher") {\\n    navItems.push({\\n      name: "Performance",'.replace(/\\\\n/g, '\\n'))) {
        code = code.replace('if (user?.role === "teacher") {\\n    navItems.push({\\n      name: "Performance",'.replace(/\\\\n/g, '\\n'), replace);
  }
  
  // also fallback using regex
  const regex = /if\s*\(user\?\.role === "teacher"\)\s*\{\s*navItems\.push\(\{\s*name: "Performance",/;
  if (!code.includes('name: "Students"')) {
     code = code.replace(regex, replace);
  }

  fs.writeFileSync(layoutPath, code);
  console.log('Success adding students to layout');
} catch (e) {
  console.error(e);
}
