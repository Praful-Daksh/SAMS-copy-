import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import apiClient from "@/api";
import { toast } from "@/common/hooks/use-toast";

interface PendingUser {
  _id: string;
  role: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  email: string;
  profileData: Record<string, any>;
  createdAt: string,
}

interface PendingUsersProps {
  users: PendingUser[];
  onApprove?: (user: PendingUser) => void;
  onReject?: (user: PendingUser) => void;
}

const ApproveModal: React.FC<{
  user: PendingUser;
  onClose: () => void;
  onConfirm: (updatedUser: PendingUser) => void;
}> = ({ user, onClose, onConfirm }) => {
  const [editedUser, setEditedUser] = useState<PendingUser>(user);
  const [formPage, setFormPage] = useState(0); // Page index
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());

  const handleChange = (key: string, value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      profileData: { ...prev.profileData, [key]: value },
    }));
  };

  const toggleEdit = (key: string) => {
    setEditingFields((prev) => {
      const updated = new Set(prev);
      updated.has(key) ? updated.delete(key) : updated.add(key);
      return updated;
    });
  };

  const allFields = Object.entries(editedUser.profileData);
  const midpoint = Math.ceil(allFields.length / 2);
  const fieldChunks =
    editedUser.role === "STUDENT"
      ? [allFields.slice(0, midpoint), allFields.slice(midpoint)]
      : [allFields];

  const currentFields = fieldChunks[formPage];
  const isLastPage = formPage === fieldChunks.length - 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg max-w-lg w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold dark:text-white mb-4">
          Approve User
        </h2>

        {currentFields.map(([key, value]) => {
          const isEditing = editingFields.has(key);

          return (
            <div key={key} className="flex items-center justify-between mb-3">
              <div className="flex flex-col w-full pr-2">
                <label className="text-sm text-gray-600 dark:text-gray-300 capitalize mb-1">
                  {key}
                </label>

                {isEditing ? (
                  <input
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="border px-2 py-1 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="text-gray-800 dark:text-gray-100 text-sm py-1">
                    {String(value)}
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleEdit(key)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
                aria-label={`Edit ${key}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {formPage > 0 && (
              <button
                onClick={() => setFormPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Back
              </button>
            )}

            {!isLastPage ? (
              <button
                onClick={() => setFormPage((prev) => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => onConfirm(editedUser)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PendingUserRow: React.FC<{
  user: PendingUser;
  onApprove?: (user: PendingUser) => void;
  onReject?: (user: PendingUser) => void;
}> = ({ user, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [sendMail, setSendMail] = useState(true);


  const createdDate = new Date(user.createdAt);
  const now = new Date();
  const diffInMs = createdDate.getTime() + 7 * 24 * 60 * 60 * 1000 - now.getTime();
  const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  const fullName =
    user.profileData?.firstName && user.profileData?.lastName
      ? `${user.profileData.firstName} ${user.profileData.lastName}`
      : "Unnamed";

  const expired = daysLeft <= 0;

  const [loading, setLoading] = useState(false);

  const approveUser = async (updatedUser: PendingUser) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/admin/approve", updatedUser);
      if (res.data.success) {
        toast({
          title: res.data.message,
          variant: "default",
        });
      }
      onApprove?.(updatedUser);
    } catch (err) {
      toast({
        title: "Hey check this !!",
        description: err.data.message,
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/admin/reject/${userId}`);
      if (res.data.success) {
        toast({ title: res.data.message, variant: "default" });
      }
      onReject?.(user);
    } catch (err) {
      toast({ title: "Something's Wrong", description: "Try again later", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <div className="border rounded dark:border-gray-600 bg-white dark:bg-gray-800">
        <button
          className="w-full px-4 py-2 flex justify-between items-center text-left font-medium dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <span>
              {fullName}
            </span>
            {expired ? (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                Expired
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </span>
            )}
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expanded && (
          <div className="px-4 py-3 text-sm dark:text-gray-300 border-t dark:border-gray-700">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            {Object.entries(user.profileData).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))}
            <p>
              <strong>Applied on:{" "}</strong>{new Date(user.createdAt).toLocaleString()}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectDialog(true)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ApproveModal
          user={user}
          onClose={() => setShowModal(false)}
          onConfirm={(updatedUser) => {
            approveUser(updatedUser);
            setShowModal(false);
          }}
        />
      )}
      {showRejectDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 rounded shadow-lg max-w-sm w-full p-5 space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Confirm Rejection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to reject <strong>{fullName}</strong>?
            </p>

            <div className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                id="send-mail"
                checked={sendMail}
                onChange={() => setSendMail(prev => !prev)}
                className="accent-blue-600"
              />
              <label htmlFor="send-mail" className="text-gray-700 dark:text-gray-300">
                Send email for re-registration
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectUser(user._id);
                  setShowRejectDialog(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

const PendingUsers: React.FC<PendingUsersProps> = ({
  users
}) => {
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);

  useEffect(() => {
    setAllUsers(users);
  }, [users]);
  const handleApprove = (approvedUser: PendingUser) => {
    setAllUsers(prev => prev.filter(user => user._id !== approvedUser._id));
  };

  const handleReject = (rejectedUser: PendingUser) => {
    setAllUsers(prev => prev.filter(user => user._id !== rejectedUser._id));
  };

  return (
    <div className="space-y-3">
      {allUsers.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No Pending Users
        </div>
      ) : (
        allUsers.map((user) => (
          <PendingUserRow
            key={user._id}
            user={user}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </div>
  );
};

export default PendingUsers;
