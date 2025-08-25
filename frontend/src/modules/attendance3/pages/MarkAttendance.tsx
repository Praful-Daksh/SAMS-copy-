import React, { useEffect, useState } from "react";
import { AttendanceStatus } from "../types/attendance.types";
import { attendanceService } from "../services/attendance.service";
import { Button } from "@/common/components/ui/button";
import { useAuthStore } from "@/modules/user-management1/store/authStore";
import apiClient from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  aparId: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Class {
  _id: string;
  department: string;
  year: number;
  section: number;
  semester: number;
  batch: string;
}

interface FacultyAssignment {
  subject: {
    id: string;
    name: string;
    department: string;
    year: number;
    semester: number;
  };
  section: number;
  students: {
    id: string;
    name: string;
    rollNumber?: string;
  }[];
}

export const MarkAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch faculty's assigned subjects and students
  useEffect(() => {
    const fetchAssignments = async () => {
      setFetching(true);
      try {
        const response = await apiClient.get("/dashboard/faculty");
        if (response.data && response.data.success) {
          setAssignments(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setSelectedAssignment(`${response.data.data[0].subject.id}-${response.data.data[0].section}`);
          }
        } else {
          setError("No subjects assigned to you");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch assignments");
      } finally {
        setFetching(false);
      }
    };
    fetchAssignments();
  }, []);

  // Initialize attendance for selected assignment
  useEffect(() => {
    if (selectedAssignment && assignments.length > 0) {
      const [subjectId, section] = selectedAssignment.split("-");
      const assignment = assignments.find(
        a => a.subject.id === subjectId && a.section.toString() === section
      );
      
      if (assignment) {
        const initialAttendance: Record<string, AttendanceStatus> = {};
        assignment.students.forEach(student => {
          initialAttendance[student.id] = AttendanceStatus.Present; // Default to present
        });
        setAttendance(initialAttendance);
      }
    }
  }, [selectedAssignment, assignments]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) {
      setError("Please select a subject and section");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const [subjectId, section] = selectedAssignment.split("-");
      const assignment = assignments.find(
        a => a.subject.id === subjectId && a.section.toString() === section
      );

      if (!assignment) {
        throw new Error("Selected assignment not found");
      }

      // Find the class for this assignment
      const classResponse = await apiClient.get("/class/details", {
        params: {
          department: assignment.subject.department,
          year: assignment.subject.year,
          section: assignment.section,
          semester: assignment.subject.semester
        }
      });

      if (!classResponse.data.success) {
        throw new Error("Class not found");
      }

      const classId = classResponse.data.classDetails._id;

      const attendanceData = {
        classId,
        subjectId,
        studentsAttendance: {
          date,
          students: assignment.students.map(student => ({
            studentId: student.id,
            status: attendance[student.id] || AttendanceStatus.Absent
          }))
        }
      };

      await attendanceService.markAttendance(attendanceData);
      setSuccess("Attendance marked successfully!");
      setAttendance({});
    } catch (err: any) {
      setError(err.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const selectedAssignmentData = selectedAssignment ? 
    assignments.find(a => `${a.subject.id}-${a.section}` === selectedAssignment) : null;

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (error && !selectedAssignmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Mark Attendance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignment">Subject & Section</Label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject and section" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem 
                        key={`${assignment.subject.id}-${assignment.section}`}
                        value={`${assignment.subject.id}-${assignment.section}`}
                      >
                        {assignment.subject.name} - Section {assignment.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    "Mark Attendance"
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm">{success}</span>
              </div>
            )}

            {selectedAssignmentData && (
              <div className="space-y-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-medium">
                      {selectedAssignmentData.subject.name} - Section {selectedAssignmentData.section}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedAssignmentData.students.length} students
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {selectedAssignmentData.students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            {student.rollNumber && (
                              <p className="text-sm text-gray-600">ID: {student.rollNumber}</p>
                            )}
                          </div>
                          <RadioGroup
                            value={attendance[student.id] || AttendanceStatus.Present}
                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={AttendanceStatus.Present} id={`present-${student.id}`} />
                              <Label htmlFor={`present-${student.id}`} className="text-green-600">Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={AttendanceStatus.Absent} id={`absent-${student.id}`} />
                              <Label htmlFor={`absent-${student.id}`} className="text-red-600">Absent</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};