import { useState } from 'react';
import { useCreateStory } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createStory = useCreateStory();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !imageFile) {
      toast.error('Please add some content or an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createStory.mutateAsync({ content: content.trim(), image: imageBlob });
      toast.success('Story created successfully!');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create story');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-surface-elevated border-white/10 rounded-3xl shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-premium">
            Create Story
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content" className="text-sm font-semibold">Caption</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a caption to your story..."
              className="mt-2 min-h-[100px] rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 transition-all"
              disabled={createStory.isPending}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 media-fade-in">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    disabled={createStory.isPending}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full press-feedback"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={createStory.isPending}
                  />
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-accent-cyan/50 transition-all press-feedback group"
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-accent-cyan transition-colors action-icon" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                  </label>
                </>
              )}
            </div>
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

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createStory.isPending}
              className="flex-1 rounded-2xl border-white/20 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStory.isPending}
              className="flex-1 rounded-2xl bg-accent-gradient hover:shadow-glow-blue press-feedback font-semibold"
            >
              {createStory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Story'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
