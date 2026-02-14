import { useState } from 'react';
import { useCreatePost } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPost = useCreatePost();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        toast.error('Please select an image or video file');
        return;
      }

      setMediaFile(file);
      setMediaType(isVideo ? 'video' : 'image');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !mediaFile) {
      toast.error('Please add some content or media');
      return;
    }

    try {
      let mediaBlob: ExternalBlob | undefined;

      if (mediaFile) {
        const arrayBuffer = await mediaFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPost.mutateAsync({ content: content.trim(), media: mediaBlob });
      toast.success('Post created successfully!');
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-surface-elevated border-white/10 rounded-3xl shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-premium">
            Create Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content" className="text-sm font-semibold">What's on your mind?</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with your classmates..."
              className="mt-2 min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus:border-accent-cyan/50 transition-all"
              disabled={createPost.isPending}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Add Media (optional)</Label>
            <div className="mt-2">
              {mediaPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 media-fade-in">
                  {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" className="w-full max-h-80 object-cover" />
                  ) : (
                    <video src={mediaPreview} controls className="w-full max-h-80" />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveMedia}
                    disabled={createPost.isPending}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full press-feedback"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                    disabled={createPost.isPending}
                  />
                  <label
                    htmlFor="media"
                    className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-accent-cyan/50 transition-all press-feedback group"
                  >
                    <div className="flex gap-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-accent-cyan transition-colors action-icon" strokeWidth={1.5} />
                      <VideoIcon className="h-8 w-8 text-muted-foreground group-hover:text-accent-purple transition-colors action-icon" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm text-muted-foreground">Click to upload photo or video</span>
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
              disabled={createPost.isPending}
              className="flex-1 rounded-2xl border-white/20 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPost.isPending}
              className="flex-1 rounded-2xl bg-accent-gradient hover:shadow-glow-blue press-feedback font-semibold"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
