import { useState } from 'react';
import { useUpdateProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '../../backend';
import { ExternalBlob } from '../../backend';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile;
}

export default function EditProfileDialog({ open, onOpenChange, currentProfile }: EditProfileDialogProps) {
  const [name, setName] = useState(currentProfile.name);
  const [className, setClassName] = useState(currentProfile.classInfo.className);
  const [year, setYear] = useState(currentProfile.classInfo.year.toString());
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !className.trim() || !year.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      toast.error('Please enter a valid year (2020-2030)');
      return;
    }

    try {
      let profilePicture = currentProfile.profilePicture;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        profilePicture = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: name.trim(),
        classInfo: {
          className: className.trim(),
          year: BigInt(yearNum),
        },
        bio: bio.trim(),
        profilePicture,
      };

      await updateProfile.mutateAsync(updatedProfile);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        toast.success('Profile updated successfully!');
        setImageFile(null);
        setImagePreview(null);
        setUploadProgress(0);
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const previewProfile = {
    name: name || currentProfile.name,
    className: className || currentProfile.classInfo.className,
    year: year || currentProfile.classInfo.year.toString(),
    bio: bio,
    image: imagePreview || currentProfile.profilePicture?.getDirectURL(),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl glass-surface-elevated border-white/10 max-h-[90vh] overflow-y-auto rounded-3xl shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-premium">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-28 w-28 avatar-ring-glow">
                  <AvatarImage
                    src={
                      imagePreview ||
                      currentProfile.profilePicture?.getDirectURL() ||
                      '/assets/generated/default-avatar.dim_256x256.png'
                    }
                  />
                  <AvatarFallback className="bg-accent-gradient text-white text-4xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={updateProfile.isPending}
                />
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-accent-gradient flex items-center justify-center cursor-pointer hover:scale-110 transition-transform press-feedback shadow-glow-blue"
                >
                  <Camera className="h-5 w-5 text-white" strokeWidth={2} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Click to change photo</p>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 transition-all"
                disabled={updateProfile.isPending}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="className" className="text-sm font-semibold">Class *</Label>
              <Input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-2 rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 transition-all"
                disabled={updateProfile.isPending}
                placeholder="e.g., 10th Grade"
              />
            </div>

            <div>
              <Label htmlFor="year" className="text-sm font-semibold">Year *</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-2 rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 transition-all"
                disabled={updateProfile.isPending}
                placeholder="2024"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2 rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 min-h-[100px] transition-all"
                disabled={updateProfile.isPending}
                placeholder="Tell us about yourself..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">{bio.length}/200 characters</p>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gradient transition-all shadow-glow-blue"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-400 animate-fade-in">
                <Check className="h-5 w-5" />
                <span className="font-semibold">Profile updated!</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateProfile.isPending}
                className="flex-1 rounded-2xl border-white/20 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfile.isPending || showSuccess}
                className="flex-1 rounded-2xl bg-accent-gradient hover:shadow-glow-blue press-feedback font-semibold"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="glass-surface rounded-3xl p-6 border border-white/10 shadow-premium">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-28 w-28 avatar-ring-glow mb-4">
                  <AvatarImage src={previewProfile.image} />
                  <AvatarFallback className="bg-accent-gradient text-white text-4xl font-bold">
                    {previewProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{previewProfile.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {previewProfile.className} • {previewProfile.year}
                </p>
                {previewProfile.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {previewProfile.bio}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This is how your profile will appear to others
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
