import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedList from '../../components/posts/FeedList';
import CreatePostDialog from '../../components/posts/CreatePostDialog';

export default function HomePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
            Home
          </h1>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="rounded-full bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback"
          >
            <Plus className="h-5 w-5 mr-2" strokeWidth={2} />
            Create Post
          </Button>
        </div>

        <FeedList />
      </div>

      <CreatePostDialog open={showCreatePost} onOpenChange={setShowCreatePost} />
    </>
  );
}
