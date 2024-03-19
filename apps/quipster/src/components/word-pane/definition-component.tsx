import { Badge } from 'dread-ui';

type DefinitionComponentProps = {
  definition?: string;
  partOfSpeech?: string;
};
const DefinitionComponent = ({
  definition = 'No definition provided',
  partOfSpeech = 'N/A',
}: DefinitionComponentProps) => {
  return (
    <div className='flex flex-nowrap gap-2'>
      <Badge variant='outline'>{partOfSpeech}</Badge>
      <p>{definition}</p>
    </div>
  );
};

export { DefinitionComponent };
