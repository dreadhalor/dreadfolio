import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
  useAuth,
} from 'dread-ui';
import { useCreatePin } from './create-pin';
import { type Category, categories } from '@shareme/utils/data';

const TextfieldArea = () => {
  const {
    setFields,
    title,
    setTitle,
    about,
    setAbout,
    destination,
    setDestination,
    category,
    setCategory,
    uploadPin,
  } = useCreatePin();

  const { uid, displayName, loading, signedIn } = useAuth();

  return (
    <div className='mt-5 flex w-full flex-1 flex-col gap-6 lg:pl-5'>
      <Input
        placeholder='Add your title here'
        className='h-auto p-2 text-3xl font-bold'
        value={title}
        onChange={(e) => {
          setFields(false);
          setTitle(e.target.value);
        }}
      />
      {signedIn && (
        <div className='my-2 flex items-center gap-2 rounded-lg bg-white'>
          <UserAvatar
            className='h-10 w-10 rounded-full border'
            loading={loading}
            uid={uid}
            signedIn={signedIn}
          />
          <p className='font-bold'>{displayName}</p>
        </div>
      )}
      <Input
        placeholder='What is your pin about?'
        value={about}
        onChange={(e) => {
          setFields(false);
          setAbout(e.target.value);
        }}
      />
      <Input
        placeholder='Add a destination link!'
        value={destination}
        onChange={(e) => {
          setFields(false);
          setDestination(e.target.value);
        }}
      />
      <div className='flex flex-col'>
        <div className='flex flex-col gap-1'>
          <Label
            htmlFor='category-select'
            className='text-lg font-semibold sm:text-xl'
          >
            Choose pin category
          </Label>
          <Select
            onValueChange={(str) => {
              setFields(false);
              setCategory(str);
            }}
          >
            <SelectTrigger id='category-select' className='capitalize'>
              <SelectValue placeholder='select category'>
                {category}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: Category) => (
                <SelectItem
                  key={category.name}
                  value={category.name}
                  className='capitalize'
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mt-5 flex items-end justify-end'>
          <Button onClick={uploadPin} className='bg-red-500 text-white'>
            Create Pin!
          </Button>
        </div>
      </div>
    </div>
  );
};

export { TextfieldArea };
