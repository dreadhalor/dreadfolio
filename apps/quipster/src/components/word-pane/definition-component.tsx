import { Badge } from 'dread-ui';

type DefinitionComponentProps = {
  definition?: string;
  partOfSpeech?: string;
};
const DefinitionComponent = ({
  definition,
  partOfSpeech,
}: DefinitionComponentProps) => {
  return (
    <div className='flex flex-wrap gap-2'>
      <Badge variant='outline'>{partOfSpeech || 'N/A'}</Badge>
      <p>{definition || 'No definition provided'}</p>
    </div>
  );
};

export { DefinitionComponent };
