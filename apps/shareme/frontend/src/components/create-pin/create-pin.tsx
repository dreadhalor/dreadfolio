import { createContext, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type SanityImageAssetDocument } from '@sanity/client';
import { client } from '@shareme/utils/client';
import { Spinner } from '@shareme/components';
import { ImageUploadArea } from './image-upload-area';
import { TextfieldArea } from './textfield-area';
import { useAchievements, useAuth } from 'dread-ui';

type CreatePinContextValue = {
  title: string;
  setTitle: (title: string) => void;
  about: string;
  setAbout: (about: string) => void;
  destination: string;
  setDestination: (destination: string) => void;
  category: string | null;
  setCategory: (category: string) => void;
  fields: boolean;
  setFields: (fields: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  imageAsset: SanityImageAssetDocument | null;
  setImageAsset: (imageAsset: SanityImageAssetDocument | null) => void;
  wrongImageType: boolean;
  setWrongImageType: (wrongImageType: boolean) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  uploadPin: () => void;
};

const CreatePinContext = createContext<CreatePinContextValue>(
  {} as CreatePinContextValue,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useCreatePin = () => {
  const context = useContext(CreatePinContext);
  if (!context) {
    throw new Error('useCreatePin must be used within a CreatePinProvider');
  }
  return context;
};

const CreatePin = () => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const [fields, setFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageAsset, setImageAsset] = useState<SanityImageAssetDocument | null>(
    null,
  );
  const [wrongImageType, setWrongImageType] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const { signedIn, uid } = useAuth();
  const { unlockAchievementById } = useAchievements();

  const uploadPin = async () => {
    if (
      !title ||
      !about ||
      !destination ||
      !category ||
      !imageAsset?._id ||
      wrongImageType
    ) {
      setFields(true);
      //setFields back to false after 2 seconds
      setTimeout(() => {
        setFields(false);
      }, 2000);
      return;
    }
    const doc = {
      _type: 'pin',
      title,
      about,
      destination,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      userId: uid,
      postedBy: {
        _type: 'postedBy',
        _ref: uid,
      },
      category,
    };
    setUploading(true);
    unlockAchievementById('create_pin', 'shareme');

    client.create(doc).then(() => {
      setUploading(false);
      navigate('/');
    });
  };

  //if there is no user, return a div saying you need to login
  if (!signedIn) {
    return (
      <div className='mt-3 flex h-full flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold'>
          <Link to={'/login'} className='hover:underline'>
            Log in to create a pin!
          </Link>
        </h1>
      </div>
    );
  }

  return (
    <CreatePinContext.Provider
      value={{
        title,
        setTitle,
        about,
        setAbout,
        destination,
        setDestination,
        category,
        setCategory,
        fields,
        setFields,
        loading,
        setLoading,
        imageAsset,
        setImageAsset,
        wrongImageType,
        setWrongImageType,
        uploading,
        setUploading,
        uploadPin,
      }}
    >
      <div className='flex flex-col items-center justify-center'>
        {fields && (
          <p className='mb-5 text-xl text-red-500 transition-all duration-150 ease-in'>
            Please fill in all the fields.
          </p>
        )}
        <div className='relative flex w-full flex-col items-center justify-center bg-white p-3 lg:mx-4 lg:flex-row'>
          {uploading && (
            <div className='absolute bottom-0 left-0 right-0 top-0 z-10 bg-[#ffffffaa]'>
              <Spinner />
            </div>
          )}
          <ImageUploadArea />
          <TextfieldArea />
        </div>
      </div>
    </CreatePinContext.Provider>
  );
};

export { CreatePin };
