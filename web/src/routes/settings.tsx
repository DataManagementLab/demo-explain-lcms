import { useState } from 'react';
import {
  useDeleteZeroShotModel,
  useGetZeroShotModels,
  usePostZeroShotModel,
} from '@/api/inference';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createFileRoute } from '@tanstack/react-router';
import { Trash2, Upload } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: Settings,
});

function Settings() {
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const models = useGetZeroShotModels();

  const postModelMutation = usePostZeroShotModel();
  const deleteModelMutation = useDeleteZeroShotModel();

  return (
    <div className="flex w-1/3 flex-col">
      <h2 className="text-lg font-bold">Models:</h2>
      <ScrollArea className="mt-2 mb-8 h-40 w-60 border px-4">
        {models.isSuccess &&
          models.data.zeroShotModels.map((model) => (
            <div key={model.id} className="flex items-center gap-1 py-2">
              <Label>{model.name}</Label>
              <div className="grow"></div>
              <Button
                variant="ghost"
                className="hover:bg-border"
                onClick={() =>
                  deleteModelMutation.mutate({ modelId: model.id })
                }
              >
                <Trash2 />
              </Button>
            </div>
          ))}
      </ScrollArea>
      <h2 className="text-lg font-bold">Upload Model:</h2>
      <form
        className="mt-2 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name || !file) {
            setShowWarning(true);
            return;
          }
          setShowWarning(false);
          postModelMutation.mutate({ name: name, file: file });
        }}
      >
        <Input
          type="text"
          placeholder="Specify model name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></Input>
        <Input
          type="file"
          className="hover:bg-border transition-colors"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        ></Input>
        <Button type="submit">
          <Upload />
        </Button>
        {showWarning && (
          <Label className="text-destructive">
            Both model name and file should be specified!
          </Label>
        )}
      </form>
    </div>
  );
}
