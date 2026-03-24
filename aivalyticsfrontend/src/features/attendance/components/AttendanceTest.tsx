import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "../../../components/ui/card";
import { getStudentAttendanceRecords } from "../../../services/attendanceApi";
import { useAuth } from "../../../contexts/AuthContext";

const AttendanceTest: React.FC = () => {
 const { user } = useAuth();
 const [testResult, setTestResult] = useState<string>("");
 const [loading, setLoading] = useState(false);

 const testAttendanceAPI = async () => {
 setLoading(true);
 setTestResult("Testing API connection...");

 try {
 console.log("🧪 Test: Starting attendance API test...");
 const result = await getStudentAttendanceRecords();

 console.log("🧪 Test: API result:", result);

 if (result.success) {
 setTestResult(
 `✅ API Test Successful!\nRecords found: ${result.data.totalRecords}\nValid records: ${result.data.records.length}`
 );
 } else {
 setTestResult(
 `❌ API Test Failed!\nError: ${"API returned success: false"}`
 );
 }
 } catch (error: any) {
 console.error("🧪 Test: API test error:", error);
 setTestResult(`❌ API Test Error!\n${error.message || "Unknown error"}`);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (user) {
 console.log("🧪 Test: User authenticated:", user);
 }
 }, [user]);

 return (
 <Card className="w-full max-w-md">
 <CardHeader>
 <CardTitle>Attendance API Test</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="text-sm text-gray-600 dark:text-gray-400">
 <p>
 <strong>User ID:</strong> {user?.id || "Not authenticated"}
 </p>
 <p>
 <strong>Role:</strong> {user?.role || "Unknown"}
 </p>
 </div>

 <Button
 onClick={testAttendanceAPI}
 disabled={loading}
 className="w-full"
 >
 {loading ? "Testing..." : "Test Attendance API"}
 </Button>

 {testResult && (
 <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
 <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
 </div>
 )}
 </CardContent>
 </Card>
 );
};

export default AttendanceTest;
