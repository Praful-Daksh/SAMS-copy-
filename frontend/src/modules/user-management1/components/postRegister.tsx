import React, { useEffect, useState } from "react";
import { Clock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FacultyProfile,
  RegisterData,
  StudentProfile,
} from "@/modules/user-management1/types/auth.types";
import { HODProfile } from "../services/hod.service";

const ApprovalPending: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    profileData: {},
  });

  useEffect(() => {
    const isRedirected = localStorage.getItem("redirect");
    if (isRedirected !== "true") {
      navigate('/login');
      return;
    }
    setUserData(JSON.parse(localStorage.getItem("registeredData") as string));

    setTimeout(() => {
      localStorage.removeItem("redirect");
      localStorage.removeItem("registeredData");
    }, 2000);
  }, []);

  const renderDataSubmitted = () => {
    switch (userData?.role) {
      case "STUDENT":
        const studentProfile = userData.profileData as StudentProfile;
        return (
          <div className="text-left mt-4">
            <h2 className="text-xl font-medium text-gray-800">
              Data Submitted
            </h2>
            <p>
              <strong>First Name:</strong> {studentProfile.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {studentProfile.lastName}
            </p>
            <p>
              <strong>Roll Number:</strong> {studentProfile.rollNumber}
            </p>
            <p>
              <strong>Phone Number:</strong> {studentProfile.phoneNumber}
            </p>
            <p>
              <strong>Apar Id:</strong> {studentProfile.aparId}
            </p>
            <p>
              <strong>Admission Date:</strong>{" "}
              {studentProfile.admission_academic_year}
            </p>
            <p>
              <strong>Date of Birth:</strong> {studentProfile.dateOfBirth}
            </p>
            <p>
              <strong>Branch:</strong> {studentProfile.department}
            </p>
            <p>
              <strong>Semester:</strong> {studentProfile.semester}
            </p>
            <p>
              <strong>Transport:</strong> {studentProfile.transport}
            </p>
            <p>
              <strong>Address: </strong> {studentProfile.address}
            </p>
            <p>
              <strong>Parent PhoneNumber:</strong>{" "}
              {studentProfile.parentPhoneNumber}
            </p>
          </div>
        );
      case "FACULTY":
        const facultyProfile = userData.profileData as FacultyProfile;
        return (
          <div className="text-left mt-4">
            <h2 className="text-xl font-medium text-gray-800">
              Data Submitted
            </h2>
            <p>
              <strong>First Name:</strong> {facultyProfile.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {facultyProfile.lastName}
            </p>
            <p>
              <strong>Phone Number:</strong> {facultyProfile.phoneNumber}
            </p>
          </div>
        );
      case "HOD":
        const hodData = userData.profileData as HODProfile;
        return (
          <div className="text-left mt-4">
            <h2 className="text-xl font-medium text-gray-800">
              Data Submitted
            </h2>
            <p>
              <strong>Faculty ID:</strong> {hodData.firstName}
            </p>
            <p>
              <strong>Department:</strong> {hodData.lastName}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Approval Request Sent
        </h1>
        <p className="text-gray-600 mt-2">
          Your registration approval request has been submitted. Please contact
          your administrator for approval.
        </p>

        {renderDataSubmitted()}

        <div className="flex items-center justify-center gap-2 mt-6 bg-blue-50 p-3 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">
            This request will expire in <strong>7 days</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPending;
