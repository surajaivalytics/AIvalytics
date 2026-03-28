const fs = require('fs');

try {
  let layoutPath = 'src/components/Layout.tsx';
  let code = fs.readFileSync(layoutPath, 'utf8');
  
  if (!code.includes('UsersIcon,')) {
    code = code.replace('BellIcon,', 'BellIcon,\n  UsersIcon,');
  }

  const teacherNavTarget = `  if (user?.role === "teacher") {\n    navItems.push({\n      name: "Performance",`;
  const teacherNavTargetWin = `  if (user?.role === "teacher") {\r\n    navItems.push({\r\n      name: "Performance",`;

  const teacherNavReplace = `  if (user?.role === "teacher") {
    navItems.push({
      name: "Students",
      href: "/students",
      icon: UsersIcon,
      current: location.pathname.startsWith("/students"),
    });
    navItems.push({
      name: "Performance",`;

  if (code.includes(teacherNavTarget)) {
    code = code.replace(teacherNavTarget, teacherNavReplace);
  } else if (code.includes(teacherNavTargetWin)) {
    code = code.replace(teacherNavTargetWin, teacherNavReplace.replace(/\n/g, '\r\n'));
  }
  
  fs.writeFileSync(layoutPath, code);
  
  let appPath = 'src/App.tsx';
  let appCode = fs.readFileSync(appPath, 'utf8');
  
  const routeTarget = `<Route path="/academic-management" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherAcademicManagement /></ProtectedLayout>} />`;
  const routeReplace = `<Route path="/academic-management" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherAcademicManagement /></ProtectedLayout>} />
  <Route path="/students" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherStudentsPage /></ProtectedLayout>} />`;
  
  if (!appCode.includes('<Route path="/students"')) {
    appCode = appCode.replace(routeTarget, routeReplace);
  }

  const importTarget = `import TeacherAcademicManagement from "./pages/teacher/TeacherAcademicManagement";`;
  const importReplace = `import TeacherAcademicManagement from "./pages/teacher/TeacherAcademicManagement";\nimport TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";`;
  
  if (!appCode.includes('import TeacherStudentsPage')) {
    appCode = appCode.replace(importTarget, importReplace);
  }
  
  fs.writeFileSync(appPath, appCode);
  console.log('Success');
} catch (e) {
  console.error(e);
}
