const fs = require('fs');

let appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  /import AcademicManagement from "\.\/pages\/AcademicManagement\/AcademicManagement";/,
  'import AcademicManagement from "./pages/AcademicManagement/AcademicManagement";\nimport TeacherUploadContent from "./pages/teacher/TeacherUploadContent";'
);

app = app.replace(
  /<Route path="\/my-courses" element=\{<ProtectedLayout allowedRoles=\{\["teacher"\]\}><MyCourses \/><\/ProtectedLayout>\} \/>/,
  '<Route path="/my-courses" element={<ProtectedLayout allowedRoles={["teacher"]}><MyCourses /></ProtectedLayout>} />\n <Route path="/upload-content" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherUploadContent /></ProtectedLayout>} />'
);

fs.writeFileSync(appPath, app);

let layoutPath = 'src/components/Layout.tsx';
let layout = fs.readFileSync(layoutPath, 'utf8');

layout = layout.replace(
  /(\s*)UsersIcon,(\r?\n)\} from "@heroicons\/react\/24\/outline";/,
  '$1UsersIcon,$2$1CloudArrowUpIcon,$2} from "@heroicons/react/24/outline";'
);

layout = layout.replace(
  /(\s*)if \(user\?\.role === "teacher"\) \{(\r?\n)(\s*)navItems\.push\(\{ name: "My Courses", href: "\/my-courses", icon: BookOpenIcon, current: location\.pathname === "\/my-courses" \}\);(\r?\n)(\s*)\}/,
  '$1if (user?.role === "teacher") {$2$3navItems.push({ name: "My Courses", href: "/my-courses", icon: BookOpenIcon, current: location.pathname === "/my-courses" });$4$3navItems.push({ name: "Upload Content", href: "/upload-content", icon: CloudArrowUpIcon, current: location.pathname === "/upload-content" });$4$5}'
);

fs.writeFileSync(layoutPath, layout);
console.log("Replacements complete.");
