import { useState, useRef } from "react";
import { Mail, Phone, Building, Hash, GraduationCap, Edit2, Lock, Save, X, Camera } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, apiUpload } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageCropper from "@/components/ImageCropper";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fresh fetch for full user details in case AuthContext is partial
  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch('/api/auth/me'),
    initialData: user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
      alert("Profile updated successfully");
    },
    onError: (err: any) => alert(err.message)
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully");
    },
    onError: (err: any) => alert(err.message)
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (fd: FormData) => apiUpload('/api/users/me/avatar', fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => alert(err.message)
  });

  // When user selects a file, validate format and open cropper
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPG, JPEG, PNG, WebP, or GIF).");
        return;
      }
      setCropFile(file);
    }
    // Reset so re-selecting same file still triggers
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // After cropping, upload the cropped blob
  const handleCropped = (blob: Blob) => {
    setCropFile(null);
    const fd = new FormData();
    fd.append("file", blob, "avatar.png");
    uploadAvatarMutation.mutate(fd);
  };


  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(editForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    changePasswordMutation.mutate({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
  };

  if (!profile) return null;

  const fields = [
    { icon: Hash, label: "Roll Number", value: profile.roll_no || "N/A" },
    { icon: Building, label: "Department / Branch", value: profile.branch || "N/A" },
    { icon: GraduationCap, label: "Role", value: profile.role?.toUpperCase() },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Phone, label: "Contact", value: profile.phone || "Not Provided" },
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
  const avatarPath = profile.avatar_url || profile.avatar;
  const avatarSrc = avatarPath ? `${API_URL}/${avatarPath}` : null;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <Lock className="h-4 w-4" /> Change Password
          </button>
          <button 
            onClick={() => { setEditForm({ name: profile.name, phone: profile.phone || "" }); setIsEditing(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        </div>
      </div>

      {isEditing && (
        <AnimatedCard className="rounded-xl border border-primary/30 bg-primary/5 p-6 relative">
          <button onClick={() => setIsEditing(false)} className="absolute right-4 top-4 hover:bg-muted p-1 rounded-md">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-primary" /> Edit Details
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Name</label>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Phone Number</label>
              <input 
                type="text" 
                value={editForm.phone} 
                onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" /> {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </AnimatedCard>
      )}

      {isChangingPassword && (
        <AnimatedCard className="rounded-xl border border-primary/30 bg-primary/5 p-6 relative">
          <button onClick={() => setIsChangingPassword(false)} className="absolute right-4 top-4 hover:bg-muted p-1 rounded-md">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Old Password</label>
              <input 
                type="password" 
                required
                value={passwordForm.oldPassword} 
                onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">New Password (Min 8 chars)</label>
              <input 
                type="password" 
                required
                minLength={8}
                value={passwordForm.newPassword} 
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={passwordForm.confirmPassword} 
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" /> {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        </AnimatedCard>
      )}

      {/* Image Cropper Modal */}
      {cropFile && (
        <ImageCropper
          imageFile={cropFile}
          onCropped={handleCropped}
          onCancel={() => setCropFile(null)}
        />
      )}

      <AnimatedCard className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-6">
          <div className="relative group">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-md" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-primary shadow-inner">
                {profile.name?.charAt(0)}
              </div>
            )}
            {uploadAvatarMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <p className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mt-2">{profile.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f, i) => (
            <div key={i} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 flex flex-col justify-center">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <f.icon className="h-4 w-4 text-primary/70" /> {f.label}
              </div>
              <p className="text-base font-medium text-foreground">{f.value}</p>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </PageTransition>
  );
}
