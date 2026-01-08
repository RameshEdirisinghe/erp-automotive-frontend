import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { UserCog, Plus, Search, Edit2, Trash2, Shield, Package, AlertCircle } from "lucide-react";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";
import { FormInput } from "../components/common/FormInput";
import { FormSelect } from "../components/common/FormSelect";
import { Modal } from "../components/common/Modal";
import UserService from "../services/UserService";
import type { User, CreateUserDto, UpdateUserDto } from "../types/users";
import { useAuth } from "../contexts/AuthContext";

const UserManagement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const [createForm, setCreateForm] = useState<CreateUserDto>({
    fullName: "",
    email: "",
    password: "",
    role: "inventory_manager"
  });

  const [editForm, setEditForm] = useState<UpdateUserDto>({
    fullName: "",
    email: "",
    role: "inventory_manager"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newUser = await UserService.createUser(createForm);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      setSuccess("User created successfully!");
      setCreateForm({
        fullName: "",
        email: "",
        password: "",
        role: "inventory_manager"
      });
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setError(null);
      const updatedUser = await UserService.updateUser(selectedUser._id, editForm);
      if (updatedUser) {
        setUsers(users.map(u => u._id === selectedUser._id ? updatedUser : u));
        setShowEditModal(false);
        setSuccess("User updated successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      const success = await UserService.deleteUser(selectedUser._id);
      if (success) {
        setUsers(users.filter(u => u._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSuccess("User deleted successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    if (user.role === 'admin' && currentUser?.role !== 'admin') {
      setError("Only admins can edit admin users");
      return;
    }
    
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
    setError(null);
  };

  const openDeleteModal = (user: User) => {
    if (user.role === 'admin') {
      setError("Cannot delete admin users");
      return;
    }
    
    setSelectedUser(user);
    setShowDeleteModal(true);
    setError(null);
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "inventory_manager", label: "Inventory Manager" }
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <UserCog className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">User Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Add User
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <FormInput
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-[#334155] rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#334155]">
                      <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-[#334155]/50 hover:bg-[#334155]/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20' 
                                : 'bg-blue-500/20'
                            }`}>
                              {user.role === 'admin' ? (
                                <Shield className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Package className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <span className="font-medium">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Inventory Manager'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3 h-3" />}
                              onClick={() => openEditModal(user)}
                              disabled={user.role === 'admin' && currentUser?.role !== 'admin'}
                              title={user.role === 'admin' && currentUser?.role !== 'admin' ? "Only admins can edit admin users" : "Edit user"}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<Trash2 className="w-3 h-3" />}
                              onClick={() => openDeleteModal(user)}
                              disabled={user.role === 'admin'}
                              title={user.role === 'admin' ? "Cannot delete admin users" : "Delete user"}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                    {searchTerm && <p className="text-sm mt-2">Try adjusting your search term</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full Name" required>
            <FormInput
              value={createForm.fullName}
              onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
              placeholder="Enter full name"
              required
            />
          </FormField>

          <FormField label="Email" required>
            <FormInput
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
              placeholder="Enter email"
              required
            />
          </FormField>

          <FormField label="Password" required>
            <FormInput
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
              placeholder="Enter password"
              required
              minLength={6}
            />
          </FormField>

          <FormField label="Role" required>
            <FormSelect
              options={roleOptions}
              value={createForm.role}
              onChange={(e) => setCreateForm({...createForm, role: e.target.value as User['role']})}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setError(null);
        }}
        title="Edit User"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <FormField label="Full Name" required>
            <FormInput
              value={editForm.fullName}
              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
              placeholder="Enter full name"
              required
            />
          </FormField>

          <FormField label="Email" required>
            <FormInput
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              placeholder="Enter email"
              required
            />
          </FormField>

          <FormField label="Role" required>
            <FormSelect
              options={roleOptions}
              value={editForm.role}
              onChange={(e) => setEditForm({...editForm, role: e.target.value as User['role']})}
              disabled={selectedUser?.role === 'admin' && currentUser?.role !== 'admin'}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">
                Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>?
              </p>
            </div>
          </div>
          
          <p className="text-gray-400">
            This action cannot be undone. The user will be permanently removed from the system.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;