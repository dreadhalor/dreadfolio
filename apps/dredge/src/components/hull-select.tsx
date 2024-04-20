import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dredge/components/ui/select';
import { hulls } from '@dredge/lib/hull-data';
import { useDredge } from '@dredge/providers/dredge-provider';
export const HullSelect = () => {
  const { hull, setHull } = useDredge();
  const handleSelect = (val: string) => {
    const selectedHull = hulls.find((hull) => hull.id === Number(val));
    if (selectedHull) {
      setHull(selectedHull);
    }
  };
  return (
    <Select value={`${hull.id}`} onValueChange={handleSelect}>
      <SelectTrigger className='w-[180px] bg-white'>
        <SelectValue placeholder='Select a hull' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='1'>Tier 1</SelectItem>
          <SelectItem value='2'>Tier 2</SelectItem>
          <SelectItem value='3'>Tier 2+</SelectItem>
          <SelectItem value='4'>Tier 3</SelectItem>
          <SelectItem value='5'>Tier 3+</SelectItem>
          <SelectItem value='6'>Tier 4</SelectItem>
          <SelectItem value='7'>Tier 4+</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
