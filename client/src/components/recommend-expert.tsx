import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Expert } from '@shared/schema';

interface RecommendExpertProps {
  prompt: string;
}

export default function RecommendExpert({ prompt }: RecommendExpertProps) {
  const [experts, setExperts] = useState<Expert[]>([]);

  const { mutate: fetchExperts, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/experts', { prompt });
      const data = await response.json();
      return data.experts as Expert[];
    },
    onSuccess: (data) => {
      setExperts(data);
    },
  });

  const handleFetchExperts = () => {
    fetchExperts();
  };

  if (!prompt) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleFetchExperts} disabled={isPending}>
          {isPending ? 'Searching...' : 'Recommend an Expert'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Expert Recommendations</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isPending ? (
            <p>Recommending...</p>
          ) : experts.length > 0 ? (
            <>
              {experts.map((expert) => (
                <div key={expert.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={expert.imageUrl} alt={expert.name} />
                    <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{expert.name}</p>
                    <p className="text-sm text-muted-foreground">{expert.specialization}</p>
                  </div>
                </div>
              ))}

              <Button asChild className="w-full mt-4 bg-blue-500 text-white hover:bg-orange-500">
                <a href="/legal-experts">
                  Click to see more details or profiles
                </a>
              </Button>
            </>
          ) : (
            <p>No experts found for this topic.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
